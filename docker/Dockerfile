# this dockerfile build VueJS app and serve static files with nginx.

# build image: `docker build -f Dockerfile --build-arg GIT_COMMIT=$(git log -1 --format=%h) --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') -t nioc/vue-dom:latest ../`
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
ENV EVENTS_READ_DELAY=

# tag image with commit SHA and date
ARG GIT_COMMIT=unspecified
ARG BUILD_DATE
LABEL org.label-schema.name="vue-dom"
LABEL org.label-schema.vendor="nioc"
LABEL org.label-schema.license="AGPL-3.0-or-later"
LABEL org.label-schema.vcs-ref=$GIT_COMMIT
LABEL org.label-schema.build-date=$BUILD_DATE
LABEL maintainer="nioc <dev@nioc.eu>"
