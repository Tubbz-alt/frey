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
CODE_DIR="${CODE_DIR:-${HOME}/code}"
echo "--> Scanning '${CODE_DIR}'..."
while IFS= read -r -d '' freyFile; do
  infraDir="$(dirname "${freyFile}")"
  echo "--> Processing '${infraDir}'..."
  pushd ${infraDir} > /dev/null
    [[ -z $(git status -s) ]] || (git diff |cat; git status ; echo "Aborting due to dirty git index at '${infraDir}'."; exit 1)
    # git reset --hard
    git checkout master
    git pull
    git checkout -B "frey-v${version}"
    # git pull origin "frey-v${version}" || true
    npm unlink frey || true
    if grep -q 'FREY_VERSION' ./Makefile; then
      "${__root}/node_modules/.bin/replace" "^FREY_VERSION\s*:?=.*$" "FREY_VERSION := ${version}" ./Makefile
      make frey
    elif [ -f ./package.json ]; then
      yarn upgrade frey@${version} || (yarn && yarn add --dev frey@${version}) || npm install --save-dev frey@${version}
    elif [ -f ../package.json ]; then
      pushd ..
      yarn upgrade frey@${version} || (yarn && yarn add --dev frey@${version}) || npm install --save-dev frey@${version}
      popd
    else
      echo "Unsure how to upgrade '${infraDir}'"
      exit 1
    fi

    # Strip the `v` prefix that is now legacy:
    "${__root}/node_modules/.bin/replace" "/v(\d+.\d+.\d+)" '/$1' "${freyFile}"

    # Upgrade roles to their latest versions
    while IFS= read -r -d '' roleDir; do
      pushd "${roleDir}"
        role="$(basename "${roleDir}")"
        latestRoleVersion=$(ls |egrep -v '^v' |sort -nr |head -n1)
        "${__root}/node_modules/.bin/replace" "/${role}/(\d+.\d+.\d+)" "/${role}/${latestRoleVersion}" "${freyFile}" || true
      popd
    done < <(find "${__root}/roles" -maxdepth 1 -type d -print0) || true

    git add --all .
    git commit -m "Upgrade Frey to v${version} /cc @tersmitten" || true
    git push
    # git push -f origin "frey-v${version}"
  popd > /dev/null
done < <(find "${CODE_DIR}" -maxdepth 3 -name Freyfile.hcl -print0)
