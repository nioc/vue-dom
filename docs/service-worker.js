importScripts("precache-manifest.5e2c515891fc9195daeb4a89a5bbbf13.js", "workbox-v4.3.1/workbox-sw.js");
workbox.setConfig({modulePathPrefix: "workbox-v4.3.1"});
/* global workbox */

workbox.precaching.precacheAndRoute([])

workbox.routing.registerRoute(
  /.*(?:\/local.js)$/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'local-js-css-cache',
  }),
)

workbox.routing.registerRoute(
  /.*\.(?:css|js)$/,
  workbox.strategies.cacheFirst({
    cacheName: 'js-css-cache',
  }),
)

workbox.routing.registerRoute(
  /.*\.(?:png|jpg|jpeg|svg|gif)$/,
  workbox.strategies.cacheFirst({
    cacheName: 'images-cache',
  }),
)

workbox.routing.registerRoute(
  /.*\.(?:woff|woff2|ttf|eot)$/,
  workbox.strategies.cacheFirst({
    cacheName: 'fonts-cache',
  }),
)

workbox.routing.registerRoute(
  /.*\.(?:php)$/,
  workbox.strategies.networkFirst({
    cacheName: 'api-cache',
  }),
)

self.addEventListener('message', (message) => {
  if (message.data === 'skipWaiting') {
    self.skipWaiting()
  }
})

