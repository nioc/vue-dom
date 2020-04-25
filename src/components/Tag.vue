<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items.sync="breadcrumbItems" />
    </div>
    <div class="hero-body">
      <div class="container">
        <ul>
          <li v-for="eqLogicId in eqLogics" :key="eqLogicId">
            <eq-logic :id="eqLogicId" />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>
import EqLogic from '@/components/EqLogic'
import Breadcrumb from '@/components/Breadcrumb'
import { createNamespacedHelpers } from 'vuex'
const { mapGetters } = createNamespacedHelpers('data')

export default {
  name: 'Tag',
  components: {
    Breadcrumb,
    EqLogic,
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
    ...mapGetters(['getEqLogicsIdByTag']),
    eqLogics () { return this.getEqLogicsIdByTag(this.tag) },
  },
  created () {
    document.title = document.title.replace('Tag |', this.tag + ' |')
    this.breadcrumbItems = [
      { link: '/', icon: 'fa-home', text: 'Home' },
      { link: '/tags/' + this.tag, icon: 'fa-tag', text: this.tag, isActive: true },
    ]
  },
}
</script>
