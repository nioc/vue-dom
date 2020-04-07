import Vue from 'vue'
import store from '@/services/Store'
import JeedomApi from '@/services/JeedomApi'
import router from '@/services/Router'
import Auth from '@/services/Auth'
import { Switch, Slider, Checkbox, Toast } from 'buefy'
import App from '@/App'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import '@fortawesome/fontawesome-free/css/regular.css'
import '@fortawesome/fontawesome-free/css/solid.css'
import '@/assets/styles.scss'
import '@/registerServiceWorker'

const custom = window.custom

Vue.use(JeedomApi, {
  jsonRpcApiUrl: custom.jsonRpcApiUrl,
  websocketUrl: custom.websocketUrl,
  store,
})

Vue.use(Switch)
Vue.use(Slider)
Vue.use(Checkbox)
Vue.use(Toast)

Vue.config.productionTip = false

// try to restore user
Auth.restoreUser()

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#vue-jeedom')
