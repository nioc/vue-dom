# this dockerfile allow download latest release and serve static files with nginx.

# build image: `docker build -f Dockerfile -t nioc/vue-dom:nginx-alpine-latest --build-arg JSON_RPC_API_URL=https://192.168.1.50/core/api/jeeApi.php --build-arg WEBSOCKET_URL=wss://192.168.1.50/socket/ .`
# start image: `docker run -d -p 80:80 --rm --name vue-dom-1 nioc/vue-dom:nginx-alpine-latest`

FROM nginx:stable-alpine

# declare arguments
ARG JSON_RPC_API_URL
ARG WEBSOCKET_URL=null

# go to Nginx content folder
WORKDIR /usr/share/nginx/html

# download vue-dom latest release
RUN curl -s https://api.github.com/repos/nioc/vue-dom/releases/latest | grep "browser_download_url" | cut -d : -f 2,3 | tr -d \" | xargs -n 1 curl -sSL | tar -xz --strip-components=1

# set local variable
RUN sed -i -r "s|jsonRpcApiUrl: 'https://10.0.0.0/core/api/jeeApi.php'|jsonRpcApiUrl: '${JSON_RPC_API_URL}'|g" /usr/share/nginx/html/local.js
RUN if [ "$WEBSOCKET_URL" != null ]; then sed -i -r "s|websocketUrl: null|websocketUrl: '${WEBSOCKET_URL}'|g" /usr/share/nginx/html/local.js ; fi
