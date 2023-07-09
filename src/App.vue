<template>
  <div>
    <navbar v-if="authStore.isAuthenticated" />
    <sidebar v-if="authStore.isAuthenticated" />
    <router-view v-if="isReady" :key="$route.fullPath" />
    <update-pwa />
  </div>
</template>

<script>
import { useAppStore } from '@/store/app'
import { useDataStore } from '@/store/data'
import { useAuthStore } from '@/store/auth'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import UpdatePwa from '@/components/UpdatePwa.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Sidebar,
    UpdatePwa,
  },
  setup() {
    const appStore = useAppStore()
    const dataStore = useDataStore()
    const authStore = useAuthStore()
    return { appStore, dataStore, authStore }
  },
  data () {
    return {
      isReady: false,
      refreshing: false,
      registration: null,
    }
  },
  watch: {
    'authStore.isAuthenticated': function () {
      if (this.authStore.isAuthenticated) {
        this.dataStore.vxLoadRooms()
        this.dataStore.vxRefreshUserViews()
      } else {
        this.$router.push({
          name: 'login',
          query: { redirect: this.$route.fullPath },
          replace: true,
        })
      }
      this.openEventsListener()
    },
    'appStore.information': function (information) {
      if (information.message) {
        const toast = {
          message: information.message,
          variant: information.type.replace('is-', ''),
          rootClass: 'toast-notification',
          position: 'bottom',
          duration: 2000,
        }
        if (information.position) {
          toast.position = information.position
        }
        if (information.duration) {
          toast.duration = information.duration
        }
        this.$oruga.notification.open(toast)
      }
    },
  },
  async created () {
    // handle connectivity
    this.appStore.setNetworkStatus(window.navigator.onLine)
    window.addEventListener('offline', this.notifyConnectivity)
    window.addEventListener('online', this.notifyConnectivity)
    // set user homepage
    const homepage = localStorage.getItem('homepage')
    await this.$router.isReady()
    if (this.$route.name === 'home' && homepage && homepage !== this.$route.fullPath) {
      this.$router.replace(homepage)
    }
    // set user theme
    if (localStorage.getItem('darkMode')) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    // load rooms
    if (this.authStore.isAuthenticated) {
      this.dataStore.vxLoadRooms()
      this.dataStore.vxRefreshUserViews()
    }
    // listen events
    this.openEventsListener()
    this.isReady = true
  },
  methods: {
    // store network status
    notifyConnectivity (event) {
      this.appStore.setNetworkStatus(window.navigator.onLine)
      if (event.type === 'online') {
        // reconnect to socket
        this.openEventsListener()
      }
    },
    openEventsListener () {
      if (this.authStore.isAuthenticated) {
        this.appStore.setEventsListener(true)
      }
    },
  },
}
</script>
