#!/usr/bin/env bash
# Frey. Copyright (c) 2016, Transloadit Ltd.
#
# This file:
#
#  - Upgrades all locally installed ~/code projects that use Frey to the current version. DANGER!
#
# Run as:
#
#  ./dependants.sh
#
# Authors:
#
#  - Kevin van Zonneveld <kevin@transloadit.com>

set -o pipefail
set -o errexit
set -o nounset
# set -o xtrace

# Set magic variables for current file & dir
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__root="$(dirname "${__dir}")"


version=$(node -e 'console.log(require("./package.json").version)')
newBranch="frey-v${version}"
allUrls=""
CODE_DIR="${CODE_DIR:-${HOME}/code}"
echo "--> Scanning '${CODE_DIR}'..."
while IFS= read -r -d '' freyFile; do
  infraDir="$(dirname "${freyFile}")"
  gitDir="${infraDir}/.git"
  if [ ! -d "${gitDir}" ]; then
    gitDir="${infraDir}/../.git"
  fi

  if [ ! -d "${gitDir}" ]; then
    echo "Aborting as I found no Git dir for '${infraDir}'.";
    exit 1
  fi

  if [[ "${freyFile}" = *"/freyfiles/"* ]]; then
    echo "--> Skipping '${freyFile}' as requested"
    continue
  fi

  echo "--> Processing '${freyFile}'..."
  pushd "${infraDir}" > /dev/null
    allUrls="${allUrls} - $(awk '/url = / {print $NF}' "${gitDir}/config" |sed -e 's#git@github.com:#https://github.com/#' -e 's#\.git$##')/compare/${newBranch}?expand=1$(echo "\\n")"
    git reset --hard
    [[ -z $(git status -s) ]] || (git diff |cat; git status ; echo "Aborting due to dirty git index at '${infraDir}'."; exit 1)
    git checkout master
    git pull
    git checkout -B "${newBranch}"
    npm unlink frey || true
    if grep -q 'FREY_VERSION' ./Makefile; then
      "${__root}/node_modules/.bin/replace" "^FREY_VERSION\s*:?=.*$" "FREY_VERSION := ${version}" ./Makefile
      git add ./Makefile || true
      make frey
    elif [ -f ./package.json ]; then
      yarn upgrade frey@${version} || (yarn && yarn add --dev frey@${version}) || npm install --save-dev frey@${version}
      git add ./package.json || true
      git add ./yarn.lock || true
    elif [ -f ../package.json ]; then
      pushd ..
        yarn upgrade frey@${version} || (yarn && yarn add --dev frey@${version}) || npm install --save-dev frey@${version}
        git add ./package.json || true
        git add ./yarn.lock || true
      popd
    else
      echo "Unsure how to upgrade '${infraDir}'"
      exit 1
    fi

    # Strip the `v` prefix that is now legacy:
    "${__root}/node_modules/.bin/replace" "/v(\d+.\d+.\d+)" '/$1' "${freyFile}"

    # Upgrade roles to their latest versions
    while IFS= read -r -d '' roleDir; do
      pushd "${roleDir}" > /dev/null
        role="$(basename "${roleDir}")"
        latestRoleVersion=$(ls |egrep -v '^v' |sort -nr |head -n1)
        "${__root}/node_modules/.bin/replace" "/${role}/(\d+.\d+.\d+)" "/${role}/${latestRoleVersion}" "${freyFile}" || true
      popd > /dev/null
    done < <(find "${__root}/roles" -maxdepth 1 -type d -print0) || true
    # Remove legacy residue
    rm -f group_vars/all/_frey.yml

    git add "${freyFile}" || true
    git commit -m "Upgrade Frey to v${version} /cc @tersmitten" || true
    git push -f origin "${newBranch}"
    git checkout master
  popd > /dev/null
done < <(find "${CODE_DIR}" -maxdepth 3 -name Freyfile.hcl -print0)

echo
echo -e "${allUrls}"
echo
echo "--> After merging the frey-v${version} branches to master in every repo, consider running"
echo "cd ${CODE_DIR}/freyfiles && ./sync-freyfiles.sh import && cd -"
echo
