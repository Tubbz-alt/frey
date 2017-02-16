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

echo "ACCPTST:STDIO_REPLACE_ELAPSED" # digitalocean_droplet.freytest-db: Still creating... (10s elapsed)

rm -f terraform.plan
rm -f "${__sysTmpDir}/frey-dynamodb"* || true

function destroy() {
  echo "(maybe) Destroying.."
  "${__node}" "${__root}/${__codelib}/cli.js" destroy \
    --force-yes \
    --cfg-var="global.terraformcfg.parallelism=1" \
  > /dev/null 2>&1 || true

  # @todo: Do we really need a target when destroying?
  # -target=aws_dynamodb_table.basic-dynamodb-table \
}

if true; then destroy; fi
if true; then trap destroy EXIT; fi

git init > /dev/null 2>&1 || true

"${__node}" "${__root}/${__codelib}/cli.js" \
  --cfg-var "global.ssh.key_dir=${__sysTmpDir}" \
  --no-color \
  --force-yes \
|| false

rm -f Frey-residu* > /dev/null 2>&1 || true
echo "Finished"
