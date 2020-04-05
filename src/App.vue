<template>
  <div>
    <navbar v-if="isAuthenticated" />
    <router-view v-if="isReady" />
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import Navbar from '@/components/Navbar'

export default {
  components: {
    Navbar,
  },
  data () {
    return {
      isReady: false,
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
