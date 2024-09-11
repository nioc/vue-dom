import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'

process.env.VITE_GIT_VERSION = execSync('git describe --tags --dirty').toString().trimEnd()

export default defineConfig({
  server: {
    port: 3000,
  },
  base: './',
  plugins: [
    vue(),
    visualizer({ open: true, gzipSize: true }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.js',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        id: 'VueDom',
        name: 'VueDom',
        'short_name': 'VueDom',
        description: 'Web front end for home automation software',
        display: 'standalone',
        'theme_color': '#96c927',
        'background_color': '#96c927',
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
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/@opentelemetry/')) {
            return 'opentelemetry'
          }
        },
      },
      plugins: [
      ],
    },
    target: 'modules',
    chunkSizeWarningLimit: 900,
    // minify: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})