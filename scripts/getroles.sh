#!/usr/bin/env bash
# Frey. Copyright (c) 2016, Transloadit Ltd.
#
# This file:
#
#  - Downloads all needed roles
#  - Aggregates licences for these roles
#
# Run as:
#
#  ./getroles.sh
#
# Authors:
#
#  - Kevin van Zonneveld <kevin@transloadit.com>
#  - Mischa ter Smitten <mischa@tersmitten.nl>

set -o pipefail
set -o errexit
set -o nounset
# set -o xtrace

# Set magic variables for current file & dir
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__file="${__dir}/$(basename "${BASH_SOURCE[0]}")"
__base="$(basename ${__file} .sh)"
__root="$(dirname "${__dir}")"

# https://github.com/freyproject/role-*

# <role name>,<role version>,<upstream branch to get changes from>
roles=(
  'apt,1.3.0,master'
  'apt,1.4.0,master'
  'rsyslog,3.1.0,master'
  'rsyslog,3.1.1,master'
  'rollback,1.2.0,master'
  'rollback,1.3.0,master'
  'rollback,2.0.0,master'
  'deploy,1.3.0,master'
  'deploy,1.4.0,master'
  'deploy,2.0.0,master'
  'nodejs-legacy,2.1.1,master'
  'nodejs-legacy,2.2.0,master'
  'nodejs-legacy,3.0.0,master'
  'redis,1.2.0,master'
  'redis,1.3.0,master'
  'redis,1.4.0,master'
  'redis,1.4.1,master'
  'redis,1.4.2,master'
  'unattended-upgrades,1.2.0,master'
  'unattended-upgrades,1.3.0,master'
  'unattended-upgrades,1.3.1,master'
  'munin,1.1.2,master'
  'munin,1.2.0,master'
  'munin-node,1.2.0,master'
  'upstart,1.0.0,master'
  'logrotate,1.0.0,master'
  'logrotate,1.0.1,master'
  'fqdn,1.0.0,master'
  'fqdn,1.1.0,master'
  'fqdn,1.1.1,master'
  'fqdn,1.2.0,master'
  'fqdn,1.2.1,master'
  'znc,1.0.4,master'
  'znc,1.0.5,master'
  'znc,1.1.0,master'
  'znc,1.2.0,master'
  'znc,1.3.0,master'
  'znc,1.3.1,master'
  'znc,1.3.2,master'
  'nginx,2.0.1,master'
  'prometheus,1.3.6,master'
  'smokeping,0.0.1,master'
  'smokeping,0.0.2,master'
  'smokeping,0.0.3,master'
  'jenkins,1.3.0,master'
  'jenkins,2.0.0,master'
  'nix,1.0.1,master'
  'nix,1.1.0,master'
  'nix,1.1.1,master'
  'nix,1.1.0,master'
  'nix,1.2.0,master'
  'nix,1.2.1,master'
  'timezone,1.0.0,master'
  'yarn,1.0.3,master'
  'nodejs,4.0.0,master'
)

for role in "${roles[@]}"; do
  roleName="$(echo "${role}" |awk -F"," '{print $1}')"
  roleVersion="$(echo "${role}" |awk -F"," '{print $2}')"

  if [ ! -f "${__root}/roles/${roleName}/${roleVersion}/README.md" ]; then
    curl -sSL "https://github.com/freyproject/role-${roleName}/archive/frey-v${roleVersion}.tar.gz" \
      -o "${__root}/roles/${roleName}-${roleVersion}.tar.gz"
    mkdir -p "${__root}/roles/${roleName}/${roleVersion}"
    tar -xzf "${__root}/roles/${roleName}-${roleVersion}.tar.gz" \
      -C "${__root}/roles/${roleName}/${roleVersion}" \
      --strip-components=1
    rm -f "${__root}/roles/${roleName}-${roleVersion}.tar.gz"
  fi

  licenseFile="$(find "${__root}/roles/${roleName}/${roleVersion}" -name 'LICENSE*')"
  if [ ! -f "${licenseFile}" ]; then
    echo "WARNING! No LICENSE found in ${__root}/roles/${roleName}/${roleVersion}"
  else
    author=$(echo $(grep Copyright "${licenseFile}" |tail -n1))

    echo "${licenseFile}"

    cp "${licenseFile}" "${__root}/licenses/${roleName}-LICENSE"

    if ! egrep "^- ${roleName}" "${__root}/licenses/index.md" > /dev/null 2>&1; then
      echo "- ${roleName} -- ${author}" >> "${__root}/licenses/index.md"
    fi

    sort "${__root}/licenses/index.md" -o "${__root}/licenses/index.md"
  fi
done
