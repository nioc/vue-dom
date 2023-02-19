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

async function main() {

  if (import.meta.env.DEV) {
    const { openTelemetry } = await import ('@/services/OpenTelemetry')
    openTelemetry('vue-dom')
  }

  const app = createApp(App)

  await initProvider()

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  app.use(Oruga, {
    ...bulmaConfig,
    iconPack: 'fas',
  })

  app.use(router)

  await useAuthStore().restoreUser()

  app.mount('#body')
}

main()
