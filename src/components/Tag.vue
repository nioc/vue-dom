<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="breadcrumbItems" />
    </div>
    <div class="hero-body">
      <div class="container">
        <ul>
          <li v-for="equipmentId in dataStore.getEquipmentsIdByTag(tag)" :key="equipmentId">
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
  name: 'Tag',
  components: {
    Breadcrumb,
    Equipment,
  },
  props: {
    tag: {
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
    equipments () {
      return this.dataStore.getEquipmentsIdByTag(this.tag)
    },
  },
  created () {
    document.title = document.title.replace('Tag |', this.tag + ' |')
    this.breadcrumbItems = [
      { link: { name: 'tag', params: { tag: this.tag } }, icon: 'fa-tag', text: this.tag, isActive: true },
    ]
  },
}
</script>
