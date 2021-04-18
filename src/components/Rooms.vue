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
        <div class="columns is-multiline">
          <room-tile v-for="room in ordered" :id="room.id" :key="room.id" />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { RoomsMixin } from '@/mixins/Rooms'
import { SummaryMixin } from '@/mixins/Summary'
import Breadcrumb from '@/components/Breadcrumb'
import RoomTile from '@/components/RoomTile'

export default {
  name: 'Rooms',
  components: {
    Breadcrumb,
    RoomTile,
  },
  mixins: [RoomsMixin, SummaryMixin],
  data () {
    return {
      search: '',
    }
  },
  computed: {
    ordered () { return this.roomsOrdered.filter((room) => this.getRoomVisiblesEquipment(room.id).length > 0 && room.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1) },
    summary () { return this.getRoomSummaryById(0) },
  },
}
</script>
