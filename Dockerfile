FROM node:12.18.2-alpine
RUN apk add --no-cache git

WORKDIR /app

# copy root package and lerna json files
COPY ./package.json /app/package.json
COPY ./lerna.json /app/lerna.json

# copy client package json
RUN mkdir -p /packages/client
COPY ./packages/client/package.json /app/packages/client/package.json

# copy shared package json
RUN mkdir -p /packages/shared
COPY ./packages/shared/package.json /app/packages/shared/package.json

# copy server package json
RUN mkdir -p /packages/server
COPY ./packages/server/package.json /app/packages/server/package.json

# copy worker package json
RUN mkdir -p /packages/worker
COPY ./packages/worker/package.json /app/packages/worker/package.json

# install dependencies
COPY ./yarn.lock /app/yarn.lock
RUN yarn install
RUN yarn lerna link

# try building the app
COPY . .
RUN yarn build

CMD echo specify one of the package.json scripts in command line
