<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-rooms'}, icon: 'fa-home', text: 'Pièces'}, {link: {name: 'admin-rooms', params: {id}}, text: room.name, isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <b-loading v-model="isLoading" :is-full-page="false" />
        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-home" /></span><span>Informations de la pièce</span>
            </p>
          </header>
          <section class="card-content">
            <div class="field is-required">
              <label class="label">Nom</label>
              <div class="control has-icons-left">
                <input v-model="room.name" class="input" type="text" placeholder="Nom de la pièce">
                <span class="icon is-small is-left">
                  <i class="fas fa-home" />
                </span>
              </div>
            </div>

            <div class="field">
              <div class="control">
                <label class="label">Statut</label>
                <b-switch v-model="room.isVisible">{{ room.isVisible ? 'Visible' : 'Masquée' }}</b-switch>
              </div>
            </div>

            <div class="field">
              <label class="label">Parent</label>
              <div class="control">
                <div class="select">
                  <select v-model="room.parentId">
                    <option :value="null">Aucun</option>
                    <option v-for="parentRoom in rooms" :key="parentRoom.id" :value="parentRoom.id">{{ parentRoom.name }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="buttons">
              <button class="button is-primary" title="Sauvegarder la pièce" @click="saveRoom">
                <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Rafraichir la pièce" @click="getRoom">
                <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Dupliquer la pièce" @click="copyRoom">
                <span class="icon"><i class="fa fa-copy" /></span><span>Dupliquer</span>
              </button>
              <button v-if="!isNew" class="button is-danger" title="Supprimer la pièce" @click="removeRoom">
                <span class="icon"><i class="fa fa-trash" /></span><span>Supprimer</span>
              </button>
            </div>
          </section>
        </div>

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-microchip" /></span><span>Equipments</span>
            </p>
          </header>
          <section class="card-content">
            <div class="table-container">
              <table class="table is-fullwidth is-striped">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Module</th>
                    <th>Identifiant logique</th>
                    <th>Statut</th>
                    <th>Visibilité</th>
                    <th>Dernière communication</th>
                    <th>Batterie</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="equipment in room.equipments" :key="equipment.id">
                    <td><router-link :to="{name: 'admin-equipment', params: {id: equipment.id}}">{{ equipment.name }}</router-link></td>
                    <td>{{ equipment.module }}</td>
                    <td>{{ equipment.logicalId }}</td>
                    <td><i class="fas fa-fw" :class="equipment.isActive ? 'fa-toggle-on has-text-success' : 'fa-toggle-off has-text-grey'" :title="equipment.isActive ? 'Actif' : 'Inactif'" /></td>
                    <td><i class="fas fa-fw" :class="equipment.isVisible ? 'fa-eye has-text-success' : 'fa-eye-slash has-text-grey'" :title="equipment.isVisible ? 'Visible' : 'Masqué'" /></td>
                    <td>
                      <time-ago v-if="equipment.lastCommunication" :date="equipment.lastCommunication" :drop-fixes="true" :title="equipment.lastCommunication | moment('LLL')" />
                    </td>
                    <td><span v-if="equipment.battery" :class="{'has-text-danger': equipment.battery < 10}">{{ equipment.battery }}%</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="buttons">
              <button v-if="!isNew" class="button is-light is-primary" title="Ajouter un équipement" @click="addEquipment">
                <span class="icon"><i class="fa fa-plus-circle" /></span><span>Ajouter</span>
              </button>
            </div>
          </section>
        </div>

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-heartbeat" /></span><span>Résumé</span>
            </p>
          </header>
          <section class="card-content">
            <div class="table-container">
              <table class="table is-fullwidth is-striped is-vertical-centered">
                <thead>
                  <tr>
                    <th>Etat</th>
                    <th>Type</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(summary, index) in room.summaryStates" :key="index">
                    <td>{{ getStateFullName(summary.state) }}</td>
                    <td><i class="fa-fw" :class="getSummaryIconClass(summary.key.toLowerCase())" />{{ getSummaryTypeLabel(summary.key) }}</td>
                    <td>
                      <button class="button is-danger is-light" title="Retirer l'état du résumé" @click="removeSummaryState(index)">
                        <span class="icon"><i class="fa fa-trash" /></span>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <options-autocomplete placeholder="Température" :value="newSummaryState.state" @select="setSummaryState" />
                    </td>
                    <td>
                      <div class="field">
                        <div class="control">
                          <span class="select">
                            <select v-model="newSummaryState.key">
                              <option :value="null">Aucun</option>
                              <option v-for="summaryKey in summaryKeys" :key="summaryKey.key" :value="summaryKey.key">{{ summaryKey.label }}</option>
                            </select>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button class="button is-primary is-light" title="Ajouter l'état au résumé" :disabled="!isNewSummaryStateValid" @click="addSummaryState">
                        <span class="icon"><i class="fa fa-plus" /></span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
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
import TimeAgo from '@/components/TimeAgo'
import { AdminMixin } from '@/mixins/Admin'
import { SummaryMixin } from '@/mixins/Summary'
import { UnsavedChangesGuardMixin } from '@/mixins/UnsavedChangesGuard'

export default {
  name: 'Room',
  components: {
    Breadcrumb,
    TimeAgo,
    OptionsAutocomplete,
  },
  mixins: [
    AdminMixin,
    SummaryMixin,
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
      room: {
        isVisible: false,
        parentId: null,
      },
      isLoading: false,
      newSummaryState: {
        state: null,
        key: null,
      },
    }
  },
  computed: {
    isNew () { return this.id === 'new' },
    isNewSummaryStateValid () { return (this.newSummaryState.key !== null && this.newSummaryState.state) },
  },
  mounted () {
    if (!this.isNew) {
      this.getRoom()
    } else {
      this.addUnsavedChangesGuard('room')
      if (this.proposal) {
        this.room = Object.assign({}, this.room, this.proposal)
      }
    }
  },
  methods: {
    async getRoom () {
      this.isLoading = true
      try {
        this.room = await this.$Provider.getRoom(this.id, true)
        this.addUnsavedChangesGuard('room')
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async saveRoom () {
      this.isLoading = true
      const result = await this.vxSaveRoom({ room: this.room, isNew: this.isNew })
      if (result) {
        if (this.isNew) {
          this.removeUnsavedChangesGuard('room')
          this.$router.replace({ name: this.$route.name, params: { id: result.id } })
        }
        this.room = Object.assign(this.room, result)
        this.addUnsavedChangesGuard('room')
      }
      this.isLoading = false
    },
    copyRoom () {
      const proposal = Object.assign({}, this.room)
      delete proposal.id
      delete proposal.modificationDate
      delete proposal.equipments
      delete proposal.summaryStates
      proposal.name = `${proposal.name} (copie)`
      this.$router.push({
        name: 'admin-room',
        params: {
          id: 'new',
          proposal,
        },
      }).catch(() => {})
    },
    async removeRoom () {
      this.$buefy.dialog.confirm({
        type: 'is-danger',
        title: 'Confirmation de suppression',
        message: '<p>La pièce sera supprimée.</p><p>Souhaitez-vous continuer ?</p>',
        hasIcon: true,
        icon: 'trash',
        iconPack: 'fa',
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        onConfirm: async () => {
          this.isLoading = true
          if (await this.vxDeleteRoom(this.room.id)) {
            this.removeUnsavedChangesGuard('room')
            this.$router.back()
          }
          this.isLoading = false
        },
      })
    },
    addEquipment () {
      this.$router.push({
        name: 'admin-equipment',
        params: {
          id: 'new',
          proposal: {
            roomId: this.room.id,
          },
        },
      }).catch(() => {})
    },
    setSummaryState (state) {
      if (state) {
        this.newSummaryState.state = state.id
        if (this.summaryKeys.some((summaryKey) => summaryKey.key === state.genericType)) {
          // state type is known, set summary state type
          this.newSummaryState.key = state.genericType
        }
      }
    },
    addSummaryState () {
      if (this.room.summaryStates.findIndex((summaryState) => (summaryState.state === this.newSummaryState.state && summaryState.key === this.newSummaryState.key)) !== -1) {
        this.$store.commit('app/setInformation', { type: 'is-warning', message: 'Cet état est déjà dans le résumé' })
        return
      }
      this.room.summaryStates.push(Object.assign({}, this.newSummaryState))
      this.newSummaryState.state = null
      this.newSummaryState.key = null
    },
    removeSummaryState (index) {
      this.room.summaryStates.splice(index, 1)
    },
  },
}
</script>
