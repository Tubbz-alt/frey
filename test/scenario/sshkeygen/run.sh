#!/usr/bin/env bash

set -o pipefail
set -o errexit
set -o nounset
# set -o xtrace

# Set magic variables for current FILE & DIR
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# __file="${__dir}/$(basename "${BASH_SOURCE[0]}")"
# __base="$(basename ${__file} .sh)"
__root="$(cd "$(dirname "$(dirname "$(dirname "${__dir}")")")" && pwd)"
__sysTmpDir="${TMPDIR:-/tmp}"
__sysTmpDir="${__sysTmpDir%/}" # <-- remove trailing slash on macosx
__node="node"; __codelib="lib"
__nodeMajor="$(node -v |sed 's/v/./' |awk -F. '{print $2}')"
if [[ "${OSTYPE}" == "darwin"* ]] && [ "${__nodeMajor}" -ge 6 ]; then
  __node="node"; __codelib="src"
fi

git init > /dev/null 2>&1 || true

rm -f "${__sysTmpDir}/frey-sshkeygen."* || true
"${__node}" "${__root}/${__codelib}/cli.js" \
  --cfgVar "global.ssh.key_dir=${__sysTmpDir}" \
  --bail-after prepare

ls "${__sysTmpDir}/frey-sshkeygen."* || true

rm -f "${__sysTmpDir}/frey-sshkeygen.pub" || true
"${__node}" "${__root}/${__codelib}/cli.js" \
  --cfgVar "global.ssh.key_dir=${__sysTmpDir}" \
  --bail-after prepare

ls "${__sysTmpDir}/frey-sshkeygen."* || true

rm -f Frey-residu* > /dev/null 2>&1 || true
