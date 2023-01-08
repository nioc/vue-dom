<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-channels'}, icon: 'fa-comments', text: 'Canaux'}, {link: {name: 'admin-channel', params: {id}}, text: channel.name, isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <o-loading v-model:active="isLoading" :full-page="false" />
        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-comments" /></span><span>Informations du canal</span>
            </p>
          </header>
          <section class="card-content">

            <div class="field is-required">
              <label class="label">Nom</label>
              <div class="control has-icons-left">
                <input v-model="channel.name" class="input" type="text" placeholder="Nom du canal">
                <span class="icon is-small is-left">
                  <i class="fas fa-tag" />
                </span>
              </div>
            </div>

            <div class="field is-required">
              <label class="label">Module</label>
              <div class="control has-icons-left">
                <input v-model="channel.module" class="input" type="text" placeholder="Module gérant le canal">
                <span class="icon is-small is-left">
                  <i class="fas fa-cogs" />
                </span>
              </div>
            </div>

            <div class="field is-required">
              <label class="label">Identifiant logique</label>
              <div class="control has-icons-left">
                <input v-model="channel.logicalId" class="input" type="text" placeholder="Identifiant logique (canal de discussion, adresse mail,...)">
                <span class="icon is-small is-left">
                  <i class="fas fa-at" />
                </span>
              </div>
            </div>

            <div class="field">
              <div class="control">
                <label class="label">Statut</label>
                <o-switch v-model="channel.isActive">{{ channel.isActive ? 'Actif' : 'Inactif' }}</o-switch>
              </div>
            </div>

            <div class="field is-required">
              <label class="label">Émission</label>
              <div class="control">
                <div class="field has-addons">
                  <options-autocomplete type="ask" title="Action transmettant la communication vers l'utilisateur" placeholder="Action transmettant la communication vers l'utilisateur" :value="channel.output" @select="setOutput" />
                  <div v-if="channel.output" class="control">
                    <router-link class="button is-primary" :to="{name: 'admin-action', params: {id: channel.output}}" title="Consulter l'action"><span class="icon" style="height: 40px;width: 40px;"><i class="fa fa-external-link-square-alt" /></span></router-link>
                  </div>
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label">Réception</label>
              <div class="control">
                <div class="field has-addons">
                  <options-autocomplete type="state" title="État recevant la communication de l'utilisateur" placeholder="État recevant la communication de l'utilisateur" :value="channel.input" @select="setInput" />
                  <div v-if="channel.input" class="control">
                    <router-link class="button is-primary" :to="{name: 'admin-state', params: {id: channel.input}}" title="Consulter l'état"><span class="icon" style="height: 40px;width: 40px;"><i class="fa fa-external-link-square-alt" /></span></router-link>
                  </div>
                </div>
              </div>
            </div>

            <div class="field">
              <div class="control">
                <label class="label">En attente d'une réponse utilisateur</label>
                <o-switch v-model="channel.hasPendingRequest" disabled />
              </div>
            </div>

            <div class="buttons">
              <button class="button is-primary" title="Sauvegarder le canal" @click="saveChannel">
                <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Rafraichir le canal" @click="getChannel">
                <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Dupliquer le canal" @click="copyChannel">
                <span class="icon"><i class="fa fa-copy" /></span><span>Dupliquer</span>
              </button>
              <button v-if="!isNew" class="button is-warning" title="Réinitialiser l'état d'attente d'une réponse utilisateur" @click="resetChannel">
                <span class="icon"><i class="fa fa-comment-slash" /></span><span>Réinitialiser</span>
              </button>
              <button v-if="!isNew" class="button is-danger" title="Supprimer le canal" @click="removeChannel">
                <span class="icon"><i class="fa fa-trash" /></span><span>Supprimer</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
import OptionsAutocomplete from '@/components/admin/OptionsAutocomplete.vue'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { useDataStore } from '@/store/data'
import { useDialog } from '@/composables/useDialog'
import { provider } from '@/services/Provider'

export default {
  name: 'Channel',
  components: {
    Breadcrumb,
    OptionsAutocomplete,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup() {
    const dataStore = useDataStore()
    const { confirmDelete } = useDialog()
    const { addUnsavedChangesGuard, removeUnsavedChangesGuard } = useUnsavedChangesGuard()
    return { dataStore, confirmDelete,addUnsavedChangesGuard, removeUnsavedChangesGuard }
  },
  data () {
    return {
      channel: {
        name: '',
        input: null,
        output: null,
      },
      isLoading: false,
    }
  },
  computed: {
    isNew () {
      return this.id === 'new'
    },
  },
  mounted () {
    if (!this.isNew) {
      this.getChannel()
    } else {
      this.addUnsavedChangesGuard(this.channel)
      if (history.state.proposal) {
        this.channel = Object.assign({}, this.channel, history.state.proposal)
      }
    }
  },
  methods: {
    async getChannel () {
      this.isLoading = true
      this.channel = await provider.getChannel(this.id)
      this.addUnsavedChangesGuard(this.channel)
      this.isLoading = false
    },
    async saveChannel () {
      this.isLoading = true
      const channel = Object.assign({}, this.channel)
      delete channel.hasPendingRequest
      const result = await this.dataStore.vxSaveChannel({ channel, isNew: this.isNew })
      if (result) {
        if (this.isNew) {
          this.removeUnsavedChangesGuard()
          this.$router.replace({ name: this.$route.name, params: { id: result.id } })
        }
        this.channel = Object.assign(this.channel, result)
        this.addUnsavedChangesGuard(this.channel)
      }
      this.isLoading = false
    },
    copyChannel () {
      const proposal = Object.assign({}, this.channel)
      delete proposal.id
      delete proposal.hasPendingRequest
      proposal.name = `${proposal.name} (copie)`
      this.$router.push({
        name: 'admin-channel',
        params: {
          id: 'new',
        },
        state: {
          proposal,
        },
      }).catch(() => {})
    },
    async removeChannel () {
      if (await this.confirmDelete('Le canal sera supprimé.')) {
        this.isLoading = true
        if (await this.dataStore.vxDeleteChannel({ channelId: this.channel.id })) {
          this.removeUnsavedChangesGuard()
          this.$router.back()
        }
        this.isLoading = false
      }
    },
    async resetChannel () {
      const channel = Object.assign({}, this.channel)
      channel.hasPendingRequest = false
      await this.dataStore.vxSaveChannel({ channel, isNew: false })
      this.getChannel()
    },
    setInput (state) {
      if (!state) {
        this.channel.input = null
        return
      }
      this.channel.input = state.id
    },
    setOutput (action) {
      if (!action) {
        this.channel.output = null
        return
      }
      this.channel.output = action.id
      if (Object.prototype.hasOwnProperty.call(action, 'stateFeedbackId') && action.stateFeedbackId !== null) {
        this.channel.input = action.stateFeedbackId
      }
    },
  },
}
</script>
