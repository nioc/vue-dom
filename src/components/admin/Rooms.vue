<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-rooms'}, icon: 'fa-home', text: 'Pièces', isActive: true}]" />
    </div>
    <div class="hero-body has-padding-horizontal-7">
      <div class="container box">
        <div class="field">
          <p class="control has-icons-left">
            <input v-model="search" class="input" type="text" placeholder="Rechercher une pièce">
            <span class="icon is-small is-left"><i class="fas fa-search" /></span>
          </p>
        </div>
        <ul class="content">
          <li v-for="room in orderedFiltered" :key="room.id" :style="'padding-left: '+room.level*20+'px;'">
            <router-link :to="{name: 'admin-room', params: {id: room.id}}" :class="{'has-text-danger': !room.isVisible}">{{ room.name }}</router-link>
          </li>
        </ul>
        <span class="buttons">
          <button class="button is-primary" @click="getRooms()">
            <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
          </button>
          <button class="button is-primary" @click="createRoom()">
            <span class="icon"><i class="fa fa-plus-circle" /></span><span>Créer</span>
          </button>
        </span>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'

function findChild (rooms, roomsOrdered, parent) {
  if (parent.id !== null) {
    roomsOrdered.push(parent)
  }
  const childs = []
  rooms.forEach((room) => {
    if (room.parentId === parent.id) {
      room.level = parent.level + 1
      childs.push(room)
    }
  })
  childs.sort((a, b) => a.order - b.order)
  childs.forEach((child) => {
    roomsOrdered = findChild(rooms, roomsOrdered, child)
  })
  return roomsOrdered
}

export default {
  name: 'Rooms',
  components: {
    Breadcrumb,
  },
  data () {
    return {
      search: '',
      rooms: [],
    }
  },
  computed: {
    filtered () { return this.rooms.filter((room) => room.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1) },
    orderedFiltered () { return findChild(this.rooms, [], { id: null, level: 0 }).filter((room) => room.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1) },
  },
  mounted () {
    this.getRooms()
  },
  methods: {
    async getRooms () {
      this.rooms = await this.$Provider.getRooms()
    },
    createRoom () {
      this.$router.push({ name: 'admin-room', params: { id: 'new' } })
    },
    async deleteRoom (id) {
      await this.$Provider.deleteRoom(id)
      this.rooms.splice(this.rooms.findIndex((room) => room.id === id), 1)
    },
  },
}
</script>
