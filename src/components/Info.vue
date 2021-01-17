<template>
  <div>
    <div class="is-flex-space-between has-margin-bottom-8">
      <span><i class="fa-fw has-margin-right-6" :class="iconClass" />{{ state.name }}<a v-if="state.isHistorized" class="has-margin-left-8 has-text-grey-light" title="Voir l'historique" @click="hasHistoryDisplayed = true"><i class="fa fa-fw fa-chart-area" /></a></span>
      <b-switch v-if="state.type==='boolean'" v-model="value" :disabled="!action" true-value="1" false-value="0" :title="state.name" class="has-margin-bottom-8" @input="action" />
      <span v-else class="is-flex-space-between">
        <ul v-if="statistics" class="has-text-grey-light is-size-7 has-text-weight-light">
          <li class="statistics-item"><span class="has-padding-horizontal-8" title="Min">{{ statistics.min }}</span></li>
          <li class="statistics-item"><span class="has-padding-horizontal-8" title="Moyenne">{{ statistics.avg }}</span></li>
          <li class="statistics-item"><span class="has-padding-horizontal-8" title="Max">{{ statistics.max }}</span></li>
        </ul>
        <i v-if="state.genericType === 'WIND_DIRECTION'" class="fa fa-location-arrow has-margin-right-8" :style="`transform: rotate(${135+parseInt(state.currentValue)}deg);`" />
        <span class="has-text-weight-semi-bold">{{ state.currentValue }}{{ unit }}</span>
      </span>
    </div>
    <div v-if="hasHistoryDisplayed" class="message is-light">
      <div class="message-header is-size-7">
        Historique
        <button class="delete" title="Fermer" @click="hasHistoryDisplayed = false" />
      </div>
      <div class="message-body has-margin-bottom-7 has-padding-8">
        <history :id="state.id" :name="state.name" />
      </div>
    </div>
  </div>
</template>

<script>
import { CmdMixin } from '@/mixins/Cmd'
import History from '@/components/History'
export default {
  components: {
    History,
  },
  mixins: [CmdMixin],
  props: {
    id: {
      type: String,
      required: true,
    },
    equipmentId: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      hasHistoryDisplayed: false,
    }
  },
  computed: {
    state () { return this.getStateById(this.id) },
    value: {
      // computed to avoid vuex mutation
      get: function () { return this.state.currentValue },
      set: () => {},
    },
    iconClass () { return this.getIconClass(this.state) },
    unit () { return this.state.unit ? ' ' + this.state.unit : '' },
    action () {
      const actions = this.getActionsByEquipmentId(this.equipmentId)
      const actionOn = actions.find((action) => action.stateFeedbackId === this.state.id && action.genericType === 'LIGHT_ON')
      const actionOff = actions.find((action) => action.stateFeedbackId === this.state.id && action.genericType === 'LIGHT_OFF')
      const actionSwitch = actions.find((action) => action.stateFeedbackId === this.state.id && action.genericType === 'LIGHT_SWITCH')
      if ((!actionOn || !actionOff) && !actionSwitch) {
        return
      }
      const vm = this
      if (actionSwitch) {
        return async (newValue) => {
        // execute action with switch value
          vm.executeAction({ id: actionSwitch.id, options: { value: newValue } })
        }
      }
      return async (newValue) => {
        // execute action whose value is related to switch
        const actionId = newValue === '1' ? actionOn.id : actionOff.id
        vm.executeAction({ id: actionId })
      }
    },
    statistics () { return this.getStateStatisticsById(this.id) },
  },
  created () {
    if (this.state.isHistorized && this.state.type !== 'boolean') {
      this.loadStateStatistics(this.state.id)
    }
  },
}
</script>
<style>
.statistics-item {
  display: inline;
}
.statistics-item:not(:last-child)::after {
  content: "|";
}
</style>
