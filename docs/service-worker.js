importScripts("precache-manifest.0f28e855943e9878a39e5e61f51b06f1.js", "workbox-v4.3.1/workbox-sw.js");
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

