# this dockerfile build VueJS app and serve static files with nginx.

# build image: `docker build -f Dockerfile -t nioc/vue-dom:latest ../`
# start image (see README.MD for environment variables): `docker run -d -p 80:80 --rm --name vue-dom-1 nioc/vue-dom:latest`


# build stage
FROM node:lts-alpine as build-stage

# install app dependencies
RUN apk add git
WORKDIR /app
COPY package*.json ./
RUN npm install

# copy app files (exluding files defined in .dockerignore)
COPY . .

# build VueJS app
RUN npm run build


# production stage
FROM nginx:stable-alpine as production-stage

# copy html files
COPY --from=build-stage /app/dist /usr/share/nginx/html

# copy nginx custom entrypoint
COPY ./docker/998-update-local.js.sh /docker-entrypoint.d/998-update-local.js.sh

# set environment variables
ENV TITLE=
ENV PROVIDER=
ENV COMPONENTS=
