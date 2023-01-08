<template>
  <o-modal v-model:active="needRefresh" content-class="modal-content dialog" :can-cancel="false" :trap-focus="true" width="460px">
    <div class="modal-card">
      <header class="modal-card-head has-text-weight-semibold">
        <p class="modal-card-title">Mise à jour disponible</p>
      </header>
      <section class="modal-card-body">
        <div class="media">
          <div class="media-left">
            <span class="icon has-text-primary is-large">
              <i class="fas fa-sync-alt fa-2x" /></span>
          </div>
          <div class="media-content">
            <div class="content">
              <p>Une mise à jour a été téléchargée.<br>souhaitez-vous recharger l'application ?</p>
            </div>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-primary" autofocus @click="udpateApp"><span class="icon"><i class="fas fa-sync-alt" /></span><span>Mettre à jour</span></button>
        <button class="button is-secondary" @click="cancel"><span class="icon"><i class="far fa-clock" /></span><span>Plus tard</span></button>
      </footer>
    </div>
  </o-modal>
</template>

<script>
import { useRegisterSW } from 'virtual:pwa-register/vue'
const { updateServiceWorker } = useRegisterSW()

export default {
  name: 'UpdatePwa',
  setup() {
    const { needRefresh, updateServiceWorker } = useRegisterSW()
    return { needRefresh, updateServiceWorker }
  },
  methods: {
    async udpateApp() {
      await updateServiceWorker()
    },
    cancel() {
      this.needRefresh = false
    },
  },
}
</script>