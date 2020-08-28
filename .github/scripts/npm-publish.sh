#!/bin/sh
DOCKER_IMAGE="$1"
NPM_TOKEN="$2"
docker run $DOCKER_IMAGE /bin/sh -c "cd packages/client \
  && echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}' > .npmrc \
  && npm publish --access public"
