<template>
  <span v-if="!hasNetwork" class="fa-stack" title="Hors connexion (réseau)">
    <i class="fa fa-wifi fa-stack-1x has-text-primary" />
    <i class="fa fa-ban fa-stack-2x has-text-danger" />
  </span>
  <a v-else-if="hasEventsListenerOpen" class="fa-stack" title="Connecté, cliquer pour déconnecter" href="#" @click="closeEventsListener">
    <i class="fa fa-exchange-alt fa-stack-1x" :class="[hasPollingEventsListener ? 'has-text-warning' : 'has-text-primary']" />
  </a>
  <a v-else class="fa-stack" title="Déconnecté, cliquer pour reconnecter" href="#" @click="openEventsListener">
    <i class="fa fa-exchange-alt fa-stack-1x has-text-primary" />
    <i class="fa fa-ban fa-stack-2x has-text-danger" />
  </a>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState } = createNamespacedHelpers('app')

export default {
  name: 'Sync',
  computed: {
    ...mapState(['hasEventsListenerOpen', 'hasNetwork', 'hasPollingEventsListener']),
  },
  methods: {
    openEventsListener (e) {
      e.preventDefault()
      this.$Provider.openEventsListener(true, true)
    },
    closeEventsListener (e) {
      e.preventDefault()
      this.$Provider.closeEventsListener()
    },
  },
}
</script>
