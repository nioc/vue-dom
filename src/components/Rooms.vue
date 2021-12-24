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
import { RoomsMixin } from '@/mixins/Rooms'
import { SummaryMixin } from '@/mixins/Summary'
import { RoomsTreeMixin } from '@/mixins/RoomsTree'
import Breadcrumb from '@/components/Breadcrumb'
import RoomsTree from '@/components/RoomsTree'

export default {
  name: 'Rooms',
  components: {
    Breadcrumb,
    RoomsTree,
  },
  mixins: [
    RoomsMixin,
    SummaryMixin,
    RoomsTreeMixin,
  ],
  data () {
    return {
      search: '',
    }
  },
  computed: {
    summary () { return this.getRoomSummaryById(0) },
    roomsTree () { return this.getRoomsTree(this.roomsRaw.filter((room) => room.isVisible), this.search) },
  },
}
</script>
