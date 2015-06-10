#!/usr/bin/env bash

branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')

./bundle_js.sh

printf "\nPushing all changes to deployment branch...\n"
git add --all :/
git commit -m "Deploying to Heroku..."
git push origin $branch:deploy

printf "\n\nWARNING! Commit not pushed to current branch $branch, please:\n\n\tgit pull\n\tgit push $branch\n\n"