<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items.sync="breadcrumbItems" :summary="summary" />
    </div>
    <div class="hero-body">
      <div class="container">
        <ul>
          <li v-for="equipmentId in room.equipments" :key="equipmentId">
            <equipment :id="equipmentId" />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>
import Equipment from '@/components/Equipment'
import Breadcrumb from '@/components/Breadcrumb'
import { SummaryMixin } from '@/mixins/Summary'
import { RoomMixin } from '@/mixins/Room'

export default {
  name: 'RoomDetail',
  components: {
    Breadcrumb,
    Equipment,
  },
  mixins: [SummaryMixin, RoomMixin],
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      breadcrumbItems: [],
    }
  },
  computed: {
    room () { return this.getRoomById(this.id) },
    title () { return this.room.name },
    summary () { return this.getRoomSummaryById(this.id) },
  },
  watch: {
    title: {
      handler (title) {
        document.title = document.title.replace('Pièce |', title + ' |')
        this.breadcrumbItems[1].text = title
      },
      deep: true,
    },
  },
  created () {
    this.breadcrumbItems = [
      { link: { name: 'rooms' }, icon: 'fa-home', text: 'Pièces' },
      { link: { name: 'rooms', params: { id: this.room.id } }, icon: 'fa-cube', text: this.room.name, isActive: true },
    ]
  },
}
</script>
