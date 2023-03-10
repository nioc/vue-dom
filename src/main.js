import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from '@/services/Router'
import { initProvider } from '@/services/Provider'
import { useAuthStore } from '@/store/auth'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import App from '@/App.vue'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import '@fortawesome/fontawesome-free/css/regular.css'
import '@fortawesome/fontawesome-free/css/solid.css'
import '@fortawesome/fontawesome-free/css/brands.css'
import '@/assets/styles.scss'
import { initialize } from '@/services/OpenTelemetry'

async function main() {
  const app = createApp(App)

  await initProvider()

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  await initialize('vue-dom', {
    router,
    pinia,
  })

  app.use(Oruga, {
    ...bulmaConfig,
    iconPack: 'fas',
  })

  await useAuthStore().restoreUser()

  app.use(router)

  app.mount('#body')
}

main()
