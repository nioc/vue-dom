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
                <label class="checkbox">
                  <input v-model="room.isVisible" type="checkbox">
                  Visible
                </label>
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
              <button class="button is-primary" title="Sauvegarder" @click="updateRoom()">
                <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
              </button>
              <button class="button is-light" title="Dupliquer" @click="copyRoom()">
                <span class="icon"><i class="fa fa-copy" /></span><span>Dupliquer</span>
              </button>
              <button class="button is-danger" title="Supprimer" @click="removeRoom()">
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

export default {
  name: 'Room',
  components: {
    Breadcrumb,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      room: {},
      rooms: [],
      isLoading: false,
    }
  },
  computed: {
  },
  mounted () {
    this.getRoom()
    this.getParents()
  },
  methods: {
    async getParents () {
      this.rooms = await this.$Provider.getRooms()
    },
    async getRoom () {
      this.isLoading = true
      this.room = await this.$Provider.getRoom(this.id)
      this.isLoading = false
    },
    async updateRoom () {
      this.isLoading = true
      try {
        await this.$Provider.updateRoom(this.room)
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async copyRoom () {
      this.isLoading = true
      try {
        const roomCopy = await this.$Provider.createRoom({
          name: 'Nouveau',
          isVisible: this.room.isVisible,
          parentId: this.room.parentId,
        })
        this.$router.push({ name: 'admin-room', params: { id: roomCopy.id } })
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async removeRoom () {
      this.isLoading = true
      try {
        await this.$Provider.deleteRoom(this.room.id)
        this.$router.back()
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
  },
}
</script>
