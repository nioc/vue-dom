<template>
  <span v-if="!hasNetwork" class="fa-stack" title="Hors connexion (réseau)">
    <i class="fa fa-wifi fa-stack-1x has-text-primary" />
    <i class="fa fa-ban fa-stack-2x has-text-danger" />
  </span>
  <a v-else-if="hasEventsListenerOpen" class="fa-stack" title="Connecté, cliquer pour déconnecter" href="#" @click="closeEventsListener()">
    <i class="fa fa-exchange fa-stack-1x has-text-primary" />
  </a>
  <a v-else class="fa-stack" title="Déconnecté, cliquer pour reconnecter" href="#" @click="openEventsListener()">
    <i class="fa fa-exchange fa-stack-1x has-text-primary" />
    <i class="fa fa-ban fa-stack-2x has-text-danger" />
  </a>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Sync',
  computed: {
    ...mapState(['hasEventsListenerOpen', 'hasNetwork']),
  },
  methods: {
    openEventsListener () {
      this.$JeedomApi.openEventsListener(true, true)
    },
    closeEventsListener () {
      this.$JeedomApi.closeEventsListener()
    },
  },
}
</script>
