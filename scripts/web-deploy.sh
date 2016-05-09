#!/usr/bin/env bash
set -o pipefail
set -o errexit
set -o nounset
# set -o xtrace

# Set magic variables for current file & dir
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__file="${__dir}/$(basename "${BASH_SOURCE[0]}")"
__base="$(basename ${__file} .sh)"

# Travis docs: Note that pull request builds skip deployment step altogether.
# https://docs.travis-ci.com/user/deployment/#Conditional-Releases-with-on

ghpages_repo=${GHPAGES_REPO:-"kvz/frey"}
ghpages_branch=${GHPAGES_BRANCH:-"gh-pages"}
ghpages_url=${GHPAGES_URL:-"https://${GH_TOKEN}@github.com/${ghpages_repo}.git"}

git config user.name "Freybot"
git config user.email "bot@freyproject.io"


echo "--> Deploying to GitHub pages.."
mkdir -p /tmp/deploy-${ghpages_repo}

# Custom steps
rsync \
  --archive \
  --delete \
  --exclude=.git* \
  --exclude=node_modules \
  --exclude=lib \
  --checksum \
  --no-times \
  --no-group \
  --no-motd \
  --no-owner \
./website/build/ /tmp/deploy-${ghpages_repo} > /dev/null

echo 'This branch is just a deploy target. Do not edit. You changes will be lost.' \
  |tee /tmp/deploy-${ghpages_repo}/README.md

(cd /tmp/deploy-${ghpages_repo} \
  && git init && git checkout -B ${ghpages_branch} && git add --all . \
  && git commit -nm "Update ${ghpages_repo} website by ${USER}" \
  && (git remote add origin ${ghpages_url}|| true)  \
  && git push origin ${ghpages_branch}:refs/heads/${ghpages_branch} --force) > /dev/null

rm -rf /tmp/deploy-${ghpages_repo}