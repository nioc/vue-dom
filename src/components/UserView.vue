<template>
  <section v-if="userView.id" class="hero">
    <div class="hero-head">
      <breadcrumb :items="breadcrumbItems" />
    </div>
    <div class="hero-body">
      <div class="container">
        <ul>
          <li v-for="card in userView.cards" :key="card.title">
            <equipment v-if="card.type==='equipment'" :id="card.id" />

            <user-view-history v-else-if="card.type==='history'" :card="card" />

            <article v-else class="card mb-4">
              <header class="card-header">
                <p class="card-header-title">{{ card.title }}</p>
                <aside class="card-header-icon is-size-7-mobile">
                  <span v-if="card.battery" :class="[card.hasLowBattery ? 'has-text-danger' : 'has-text-grey']"><i class="fa-mr" :class="getBatteryLevelIconClass(card.battery)" />{{ card.battery }}%</span>
                  <span v-if="card.lastCommunication" :title="lastCommunicationTitle" :class="[card.hasNoCommunication ? 'has-text-danger' : 'has-text-grey']" class="ml-2"><i class="fa-mr far fa-clock" /><time-ago :date="card.lastCommunication" :drop-fixes="true" /></span>
                </aside>
              </header>

              <div class="card-content">
                <div v-for="(element, index) in card.elements" :key="index">
                  <info v-if="element.type==='state'" :id="element.id" :key="element.id" :equipment-id="element.parentId" :label="element.label" />
                </div>
              </div>

            </article>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
import TimeAgo from '@/components/TimeAgo.vue'
import Equipment from '@/components/Equipment.vue'
import Info from '@/components/Info.vue'
import UserViewHistory from '@/components/UserViewHistory.vue'
import { useDataStore } from '@/store/data'
import { useEquipmentsHelper } from '@/composables/useEquipmentsHelper'
import { dtFormat } from '@/services/Datetime'

export default {
  name: 'UserView',
  components: {
    Breadcrumb,
    TimeAgo,
    Equipment,
    Info,
    UserViewHistory,
  },
  props: {
    code: {
      type: String,
      required: true,
    },
  },
  setup() {
    const dataStore = useDataStore()
    const { getBatteryLevelIconClass } = useEquipmentsHelper()
    return { dataStore, getBatteryLevelIconClass }
  },
  data () {
    return {
      breadcrumbItems: [],
    }
  },
  computed: {
    userView () {
      return this.dataStore.getUserViewByCode(this.code)
    },
    lastCommunicationTitle () {
      return dtFormat(this.equipment.lastCommunication, 'PPPPpp')
    },
  },
  created () {
    document.title = document.title.replace('View |', this.userView.title + ' |')
    this.breadcrumbItems = [
      { link: { }, icon: 'fa-binoculars', text: 'Vues', isActive: true },
      { link: { name: 'view', params: { code: this.code } }, icon: this.userView.icon, text: this.userView.title, isActive: true },
    ]
  },
}
</script>
