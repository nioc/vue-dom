<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-rooms'}, icon: 'fa-home', text: 'Pièces'}, {link: {name: 'admin-rooms', params: {id}}, text: room.name, isActive: true}]" />
    </div>
    <div class="hero-body has-padding-horizontal-7">
      <div class="container">
        <b-loading v-model="isLoading" :is-full-page="false" />
        <div class="card has-margin-bottom-6">
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
              <button class="button is-primary" title="Sauvegarder" @click="saveRoom()">
                <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Dupliquer" @click="copyRoom()">
                <span class="icon"><i class="fa fa-copy" /></span><span>Dupliquer</span>
              </button>
              <button v-if="!isNew" class="button is-danger" title="Supprimer" @click="removeRoom()">
                <span class="icon"><i class="fa fa-trash" /></span><span>Supprimer</span>
              </button>
            </div>
          </section>
        </div>
        <div class="card has-margin-bottom-6">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-microchip" /></span><span>Equipments</span>
            </p>
          </header>
          <section class="card-content">
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
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import TimeAgo from '@/components/TimeAgo'
import { AdminMixin } from '@/mixins/Admin'

export default {
  name: 'Room',
  components: {
    Breadcrumb,
    TimeAgo,
  },
  mixins: [AdminMixin],
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
    }
  },
  computed: {
    isNew () { return this.id === 'new' },
  },
  mounted () {
    if (!this.isNew) {
      this.getRoom()
    } else {
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
          this.$router.replace({ name: this.$route.name, params: { id: result.id } })
        }
        this.room = Object.assign(this.room, result)
      }
      this.isLoading = false
    },
    async copyRoom () {
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
      })
    },
    async removeRoom () {
      this.isLoading = true
      if (await this.vxDeleteRoom(this.room.id)) {
        this.$router.back()
      }
      this.isLoading = false
    },
  },
}
</script>
