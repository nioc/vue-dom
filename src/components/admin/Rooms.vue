<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-rooms'}, icon: 'fa-home', text: 'Pièces', isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container box">
        <div class="field">
          <p class="control has-icons-left">
            <input v-model="search" class="input" type="text" placeholder="Rechercher une pièce">
            <span class="icon is-small is-left"><i class="fas fa-search" /></span>
          </p>
        </div>
        <rooms-tree :rooms="roomsTree" class="mb-5 tree" />
        <span class="buttons">
          <button class="button is-primary" @click="getRooms">
            <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
          </button>
          <button class="button is-primary" @click="createRoom">
            <span class="icon"><i class="fa fa-plus-circle" /></span><span>Créer</span>
          </button>
        </span>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import RoomsTree from '@/components/admin/RoomsTree'
import { AdminMixin } from '@/mixins/Admin'
const cloneDeep = require('lodash.clonedeep')

function setLevel (rooms, parentId, search) {
  const childs = []
  rooms
    .filter((room) => room.parentId === parentId)
    .forEach((childRoom) => {
      childRoom.childs = setLevel(rooms, childRoom.id, search)
      if (childRoom.childs.length === 0) {
        if (Object.prototype.hasOwnProperty.call(childRoom, 'name') && childRoom.name && childRoom.name.toLowerCase().indexOf(search) > -1) {
          childs.push(childRoom)
        }
      } else {
        childs.push(childRoom)
      }
    })
  return childs
}

export default {
  name: 'Rooms',
  components: {
    Breadcrumb,
    RoomsTree,
  },
  mixins: [
    AdminMixin,
  ],
  data () {
    return {
      search: '',
    }
  },
  computed: {
    roomsTree () { return setLevel(Object.values(cloneDeep(this.rooms)), null, this.search.toLowerCase()) },
  },
  methods: {
    async getRooms () {
      this.vxRefreshRooms()
    },
    createRoom () {
      this.$router.push({ name: 'admin-room', params: { id: 'new' } })
    },
  },
}
</script>
