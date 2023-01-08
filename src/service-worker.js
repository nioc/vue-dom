import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

cleanupOutdatedCaches()

registerRoute(
  /\/api\//,
  new NetworkFirst({
    cacheName: 'api-cache',
  }),
)

registerRoute(
  /local\.js$/,
  new NetworkFirst({
    cacheName: 'localjs-cache',
  }),
)

precacheAndRoute(self.__WB_MANIFEST)
