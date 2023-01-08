<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'rooms'}, icon: 'fa-home', text: 'Pièces', isActive: true}]" :summary="summary" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <div class="field">
          <p class="control has-icons-left">
            <input v-model="search" class="input" type="text" placeholder="Rechercher une pièce">
            <span class="icon is-small is-left"><i class="fas fa-search" /></span>
          </p>
        </div>
        <rooms-tree :rooms="roomsTree" class="mb-5 tree" />
      </div>
    </div>
  </section>
</template>

<script>
import { useRoomsTree } from '@/composables/useRoomsTree.js'
import { useDataStore } from '@/store/data'
import Breadcrumb from '@/components/Breadcrumb.vue'
import RoomsTree from '@/components/RoomsTree.vue'

export default {
  name: 'Rooms',
  components: {
    Breadcrumb,
    RoomsTree,
  },
  setup() {
    const dataStore = useDataStore()
    const { getRoomsTree } = useRoomsTree()
    return { dataStore, getRoomsTree }
  },
  data () {
    return {
      search: '',
    }
  },
  computed: {
    summary () {
      return this.dataStore.getRoomSummaryById(0)
    },
    roomsTree () {
      return this.getRoomsTree(this.dataStore.roomsRaw.filter((room) => room.isVisible), this.search)
    },
  },
}
</script>
