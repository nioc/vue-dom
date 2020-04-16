<template>
  <div>
    <navbar v-if="isAuthenticated" />
    <router-view v-if="isReady" />
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Navbar from '@/components/Navbar'
const { mapState, mapMutations } = createNamespacedHelpers('app')
const { mapActions } = createNamespacedHelpers('objects')

export default {
  components: {
    Navbar,
  },
  data () {
    return {
      isReady: false,
      refreshing: false,
      registration: null,
    }
  },
  computed: {
    ...mapState(['isAuthenticated', 'information']),
  },
  watch: {
    isAuthenticated: function () {
      this.loadObjects()
      this.openEventsListener()
    },
    information: function (information) {
      this.$buefy.toast.open({
        message: information.message,
        type: information.type,
        position: 'is-bottom',
      })
    },
  },
  created () {
    // handle update from service worker
    document.addEventListener(
      'updated', this.askForRefresh, { once: true },
    )
    // reload page if requested by service worker
    navigator.serviceWorker.addEventListener(
      'controllerchange', () => {
        if (this.refreshing) {
          return
        }
        this.refreshing = true
        window.location.reload()
      },
    )
    // load objects
    if (this.isAuthenticated) {
      this.loadObjects()
    }
    this.openEventsListener()
    // handle connectivity
    this.setNetworkStatus(window.navigator.onLine)
    window.addEventListener('offline', this.notifyConnectivity)
    window.addEventListener('online', this.notifyConnectivity)
    this.isReady = true
  },
  methods: {
    // display confirm dialog for refreshing application
    askForRefresh (e) {
      this.registration = e.detail
      this.$buefy.dialog.confirm({
        title: 'Mise à jour',
        message: 'Une mise à jour a été téléchargée, souhaitez-vous recharger l\'application ?',
        cancelText: 'Plus tard',
        hasIcon: true,
        icon: 'sync-alt',
        iconPack: 'fa',
        onConfirm: () => this.refreshApp(),
      })
    },
    // refresh application from updated service worker
    refreshApp () {
      if (!this.registration || !this.registration.waiting) {
        return
      }
      this.registration.waiting.postMessage('skipWaiting')
    },
    // store network status
    notifyConnectivity (event) {
      this.setNetworkStatus(window.navigator.onLine)
      if (event.type === 'online') {
        // reconnect to socket
        this.openEventsListener()
      }
    },
    openEventsListener () {
      if (this.isAuthenticated) {
        this.$JeedomApi.openEventsListener(true, false)
      }
    },
    ...mapActions(['loadObjects']),
    ...mapMutations(['setNetworkStatus']),
  },
}
</script>
