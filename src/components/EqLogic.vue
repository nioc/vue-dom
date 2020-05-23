<template>
  <article class="card has-margin-bottom-6">
    <header class="card-header">
      <p class="card-header-title">{{ eqLogic.name }}</p>
      <aside class="card-header-icon is-size-7-mobile">
        <span v-if="eqLogicBattery" class="has-text-grey"><i class="fa-mr" :class="eqLogicBattery.iconClass" />{{ eqLogicBattery.currentValue }}%</span>
        <span v-if="eqLogic.status.lastCommunication" :title="eqLogic.status.lastCommunication | moment('LLLL')" class="has-text-grey has-margin-left-8"><i class="fa-mr far fa-clock" /><time-ago :date="eqLogic.status.lastCommunication" :drop-fixes="true" /></span>
      </aside>
    </header>
    <custom-component v-if="isEqLogicHandled(eqLogic.eqTypeName)" :component="getEqLogicComponent(eqLogic.eqTypeName)" :eq-logic="eqLogic" class="card-content" />
    <generic-component v-else :eq-logic="eqLogic" class="card-content" />
  </article>
</template>

<script>
import TimeAgo from '@/components/TimeAgo'
import CustomComponent from '@/components/eqLogic/CustomComponent'
import GenericComponent from '@/components/eqLogic/GenericComponent'
import { createNamespacedHelpers } from 'vuex'
import { CmdMixin } from '@/mixins/Cmd'
const custom = window.custom
const { mapGetters } = createNamespacedHelpers('data')

export default {
  components: {
    TimeAgo,
    CustomComponent,
    GenericComponent,
  },
  mixins: [CmdMixin],
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  computed: {
    eqLogic () { return this.getEqLogicById(this.id) },
    eqLogicBattery: function () {
      const battery = this.eqLogic.status.battery
      if (battery) {
        return {
          currentValue: battery,
          iconClass: this.getBatteryLevelIconClass(battery),
        }
      }
      return null
    },
    ...mapGetters(['getEqLogicById']),
  },
  methods: {
    getEqLogicComponent (eqType) {
      return custom.components[eqType]
    },
    isEqLogicHandled (eqType) {
      return (custom.components[eqType] !== undefined)
    },
  },
}
</script>
