<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items.sync="breadcrumbItems" :html="summaryHtml" />
    </div>
    <div class="hero-body">
      <div class="container">
        <ul>
          <li v-for="eqLogicId in object.eqLogics" :key="eqLogicId">
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
import { SummaryMixin } from '@/mixins/Summary'
import { ObjectMixin } from '@/mixins/Object'

export default {
  name: 'ObjectDetail',
  components: {
    Breadcrumb,
    EqLogic,
  },
  mixins: [SummaryMixin, ObjectMixin],
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
    object () { return this.objectById(this.id) },
    title () { return this.object.name },
    summaryHtml () { return this.getSummaryHtml(this.id) },
  },
  watch: {
    title: {
      handler (title) {
        document.title = document.title.replace('Objet |', title + ' |')
        this.breadcrumbItems[1].text = title
      },
      deep: true,
    },
  },
  created () {
    this.loadObject(this.id)
    this.breadcrumbItems = [
      { link: '/', icon: 'fa-home', text: 'Home' },
      { link: '/objects/' + this.object.id, icon: 'fa-cube', text: this.object.name, isActive: true },
    ]
  },
}
</script>
