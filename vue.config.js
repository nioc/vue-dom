module.exports = {
  pwa: {
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      importWorkboxFrom: 'local',
      swSrc: 'src/service-worker.js',
    },
    name: 'Jeedom',
    themeColor: '#96c927',
    msTileColor: '#96c927',
    iconPaths: {
      favicon32: 'img/favicon-32x32.png',
      favicon16: 'img/favicon-16x16.png',
      appleTouchIcon: 'img/apple-touch-icon.png',
      maskIcon: 'img/safari-pinned-tab.svg',
      msTileImage: 'img/mstile-150x150.png',
    },
    manifestOptions: {
      background_color: '#96c927',
      icons: [
        {
          src: 'img/android-icon-36x36.png',
          sizes: '36x36',
          type: 'image/png',
          density: '0.75',
        },
        {
          src: 'img/android-icon-48x48.png',
          sizes: '48x48',
          type: 'image/png',
          density: '1.0',
        },
        {
          src: 'img/android-icon-72x72.png',
          sizes: '72x72',
          type: 'image/png',
          density: '1.5',
        },
        {
          src: 'img/android-icon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
          density: '2.0',
        },
        {
          src: 'img/android-icon-144x144.png',
          sizes: '144x144',
          type: 'image/png',
          density: '3.0',
        },
        {
          src: 'img/android-icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          density: '4.0',
        },
      ],
    },
  },
  publicPath: './',
}
