<template>
  <span v-if="!appStore.hasNetwork" class="fa-stack" title="Hors connexion (réseau)">
    <i class="fa fa-wifi fa-stack-1x has-text-primary" />
    <i class="fa fa-ban fa-stack-2x has-text-danger" />
  </span>
  <a v-else-if="appStore.isEventsListenerOpening" class="fa-stack" title="Connexion en cours" href="#">
    <i class="fa fa-exchange-alt fa-stack-1x" :class="[appStore.hasPollingEventsListener ? 'has-text-warning' : 'has-text-primary']" />
    <i class="fas fa-spinner fa-pulse has-text-primary-dark fa-stack-2x" style="opacity: 50%;" />
  </a>
  <a v-else-if="appStore.hasEventsListenerOpen" class="fa-stack" title="Connecté, cliquer pour déconnecter" href="#" @click="closeEventsListener">
    <i class="fa fa-exchange-alt fa-stack-1x" :class="[appStore.hasPollingEventsListener ? 'has-text-warning' : 'has-text-primary']" />
  </a>
  <a v-else class="fa-stack" title="Déconnecté, cliquer pour reconnecter" href="#" @click="openEventsListener">
    <i class="fa fa-exchange-alt fa-stack-1x has-text-primary" />
    <i class="fa fa-ban fa-stack-2x has-text-danger" />
  </a>
</template>

<script>
import { useAppStore } from '@/store/app'

export default {
  name: 'Sync',
  setup() {
    const appStore = useAppStore()
    return { appStore }
  },
  beforeMount () {
    // expose events listener functions to global for outside calls
    window.vueDomEventsListener = {
      open: () => this.openEventsListener(new Event('openEventsListener')),
      close: () => this.closeEventsListener(new Event('closeEventsListener')),
    }
  },
  methods: {
    openEventsListener (e) {
      e.preventDefault()
      this.appStore.setEventsListener(true)
    },
    closeEventsListener (e) {
      e.preventDefault()
      this.appStore.setEventsListener(false)
    },
  },
}
</script>
