<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-channels'}, icon: 'fa-comments', text: 'Canaux'}, {link: {name: 'admin-channel', params: {id}}, text: channel.name, isActive: true}]" />
    </div>
    <div class="hero-body has-padding-horizontal-7">
      <div class="container">
        <b-loading v-model="isLoading" :is-full-page="false" />
        <div class="card has-margin-bottom-6">
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

            <div class="field is-required">
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
                <b-switch v-model="channel.hasPendingRequest" disabled />
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
import Breadcrumb from '@/components/Breadcrumb'
import OptionsAutocomplete from '@/components/admin/OptionsAutocomplete'
import { AdminMixin } from '@/mixins/Admin'
import { UnsavedChangesGuardMixin } from '@/mixins/UnsavedChangesGuard'

export default {
  name: 'Channel',
  components: {
    Breadcrumb,
    OptionsAutocomplete,
  },
  mixins: [
    AdminMixin,
    UnsavedChangesGuardMixin,
  ],
  props: {
    id: {
      type: String,
      required: true,
    },
    proposal: {
      type: Object,
      required: false,
      default: () => {},
    },
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
    isNew () { return this.id === 'new' },
  },
  mounted () {
    if (!this.isNew) {
      this.getChannel()
    } else {
      this.addUnsavedChangesGuard('channel')
      if (this.proposal) {
        this.channel = Object.assign({}, this.channel, this.proposal)
      }
    }
  },
  methods: {
    async getChannel () {
      this.isLoading = true
      this.channel = await this.$Provider.getChannel(this.id)
      this.addUnsavedChangesGuard('channel')
      this.isLoading = false
    },
    async saveChannel () {
      this.isLoading = true
      const channel = Object.assign({}, this.channel)
      delete channel.hasPendingRequest
      const result = await this.vxSaveChannel({ channel, isNew: this.isNew })
      if (result) {
        if (this.isNew) {
          this.removeUnsavedChangesGuard('channel')
          this.$router.replace({ name: this.$route.name, params: { id: result.id } })
        }
        this.channel = Object.assign(this.channel, result)
        this.addUnsavedChangesGuard('channel')
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
          proposal,
        },
      }).catch(() => {})
    },
    async removeChannel () {
      this.$buefy.dialog.confirm({
        type: 'is-danger',
        title: 'Confirmation de suppression',
        message: '<p>Le canal sera supprimé.</p><p>Souhaitez-vous continuer ?</p>',
        hasIcon: true,
        icon: 'trash',
        iconPack: 'fa',
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        onConfirm: async () => {
          this.isLoading = true
          if (await this.vxDeleteChannel({ channelId: this.channel.id })) {
            this.removeUnsavedChangesGuard('channel')
            this.$router.back()
          }
          this.isLoading = false
        },
      })
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
