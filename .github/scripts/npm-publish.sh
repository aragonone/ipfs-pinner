#!/bin/sh
export NPM_TOKEN="$1"
cd packages/client
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
npm publish --access public
