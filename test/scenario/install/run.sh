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
if [[ "${OSTYPE}" == "darwin"* ]]; then
  __node="node"; __codelib="src"
fi

echo "ACCPTST:STDIO_REPLACE_LONGTIMES"
echo "ACCPTST:STDIO_REPLACE_DURATIONS"
echo "ACCPTST:STDIO_REPLACE_ASTERISKHR"

# PYTHONPATH="${HOME}/.frey/tools/ansible/2.1.4/pip/lib/python2.7/site-packages" \
#   "${HOME}/.frey/tools/ansible/2.1.4/pip/bin/ansible-playbook" \
#   --help
#
# exit

# echo WIP
# exit 0

rm -f terraform.plan
rm -f "${__sysTmpDir}/frey-install"* || true

git init > /dev/null 2>&1 || true

env -i \
PATH=${PATH} \
USER=${USER} \
HOME=${HOME} \
SCROLEX_MODE=${SCROLEX_MODE:-} \
DEBUG=${DEBUG:-} \
FREY_SHOULD_BE_AS_VAR_IN_ANSIBLE=now \
"${__node}" "${__root}/${__codelib}/cli.js" install \
  --cfg-var "global.ssh.key_dir=${__sysTmpDir}" \
  --no-color \
  --force-yes \
  --bail \
|| false


cat group_vars/all/Frey-residu-playbooks_vars.yml

rm -f Frey-residu* > /dev/null 2>&1 || true

echo "Finished"
