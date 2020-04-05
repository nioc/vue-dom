import Vue from 'vue'
import store from '@/services/Store'
import JeedomApi from '@/services/JeedomApi'
import router from '@/services/Router'
import Auth from '@/services/Auth'
import Buefy from 'buefy'
import App from '@/App'
import 'font-awesome/css/font-awesome.min.css'
import '@/assets/styles.scss'
import '@/registerServiceWorker'

const custom = window.custom

Vue.use(JeedomApi, {
  jsonRpcApiUrl: custom.jsonRpcApiUrl,
  websocketUrl: custom.websocketUrl,
  store,
})

Vue.use(Buefy, {
  defaultIconPack: 'fa',
})

Vue.config.productionTip = false

// try to restore user
Auth.restoreUser()

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#vue-jeedom')
