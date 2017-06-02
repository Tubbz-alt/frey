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
rm -f *.pem > /dev/null 2>&1 || true
rm -f Freyfile.hcl > /dev/null 2>&1 || true

# We seem to not be able to guarantee the create order of multiple web hosts, so override with count = 1 in tests
"${__node}" "${__root}/${__codelib}/cli.js" convert --projectDir .\
  --no-color \
  --forceYes \
|| false

cat Freyfile.hcl

rm -f *.pem > /dev/null 2>&1 || true
rm -f Frey-residu* > /dev/null 2>&1 || true

echo "Finished"
