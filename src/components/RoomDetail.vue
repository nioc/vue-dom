<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb v-model:items="breadcrumbItems" :summary="summary" />
    </div>
    <div class="hero-body">
      <div class="container">
        <ul>
          <li v-for="equipmentId in equipments" :key="equipmentId">
            <equipment :id="equipmentId" />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>
import Equipment from '@/components/Equipment.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { useDataStore } from '@/store/data'

export default {
  name: 'RoomDetail',
  components: {
    Breadcrumb,
    Equipment,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup() {
    const dataStore = useDataStore()
    return { dataStore }
  },
  data () {
    return {
      breadcrumbItems: [],
    }
  },
  computed: {
    room () {
      return this.dataStore.getRoomById(this.id)
    },
    title () {
      document.title = document.title.replace('Pièce |', this.room.name + ' |')
      return this.room.name
    },
    summary () {
      return this.dataStore.getRoomSummaryById(this.id)
    },
    equipments () {
      return this.dataStore.getRoomVisiblesEquipment(this.id)
    },
  },
  watch: {
    title () {
    },
  },
  created () {
    this.breadcrumbItems = [
      { link: { name: 'rooms' }, icon: 'fa-home', text: 'Pièces' },
      { link: { name: 'room', params: { id: this.room.id } }, icon: this.room.icon ? this.room.icon : 'fas fa-cube', text: this.room.name, isActive: true },
    ]
  },
}
</script>
