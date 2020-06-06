<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items.sync="breadcrumbItems" />
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
import Equipment from '@/components/EqLogic'
import Breadcrumb from '@/components/Breadcrumb'
import { createNamespacedHelpers } from 'vuex'
const { mapGetters } = createNamespacedHelpers('data')

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
  data () {
    return {
      breadcrumbItems: [],
    }
  },
  computed: {
    ...mapGetters(['getEquipmentsIdByTag']),
    equipments () { return this.getEquipmentsIdByTag(this.tag) },
  },
  created () {
    document.title = document.title.replace('Tag |', this.tag + ' |')
    this.breadcrumbItems = [
      { link: { name: 'tag', params: { tag: this.tag } }, icon: 'fa-tag', text: this.tag, isActive: true },
    ]
  },
}
</script>
