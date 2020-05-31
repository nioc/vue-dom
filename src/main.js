import Vue from 'vue'
import store from '@/store'
import Provider from '@/services/Provider'
import router from '@/services/Router'
import Auth from '@/services/Auth'
import Buefy from '@/mixins/Buefy'
import VueMoment from 'vue-moment'
import moment from 'moment'
import 'moment/locale/fr'
import App from '@/App'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import '@fortawesome/fontawesome-free/css/regular.css'
import '@fortawesome/fontawesome-free/css/solid.css'
import '@/assets/styles.scss'
import '@/registerServiceWorker'

Vue.use(VueMoment, {
  moment,
})

Vue.use(Provider, {
  store,
})

Vue.use(Buefy)

Vue.config.productionTip = false

// try to restore user
Auth.restoreUser()

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#vue-dom')
