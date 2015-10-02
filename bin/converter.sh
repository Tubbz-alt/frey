#!/usr/bin/env bash

set -o pipefail
set -o errexit
set -o nounset
# set -o xtrace

project="${1:-tusd}"
tfFile="${2:-/Users/kvz/code/infra-tusd/envs/production/infra.tf}"
ansFile="${3:-}"
tfDir="$(dirname "${tfFile}")"
tfBase="$(basename "${tfFile}" .tf)"
jsonFile="${tfDir}/${tfBase}.tf.json"
csonFile="${tfDir}/${tfBase}.cson"
tomlFile="${tfDir}/frey.toml"

which hcltool || pip install pyhcl

go get github.com/dbohdan/remarshal

echo "Writing '${jsonFile}'"
hcltool "${tfFile}" "${jsonFile}"

cd "${GOPATH}/src/github.com/dbohdan/remarshal"
echo "Writing '${tomlFile}'"
go run remarshal.go -if json -of toml -wrap infra -i "${jsonFile}" > "${tomlFile}"

if [ -n "${ansFile}" ]; then
  echo "Appending '${tomlFile}'"
  go run remarshal.go -if yaml -of toml -wrap config -i "${ansFile}" >> "${tomlFile}"
fi

echo "Reading '${tfFile}'"
cat "${tomlFile}"

echo "Moving '${tfFile}'"
mv "${tfFile}" "${tfFile}.bak-$(date +%s)"

echo "Removing '${jsonFile}'"
rm -f "${jsonFile}"