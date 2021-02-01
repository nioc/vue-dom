<template>
  <div>
    <div class="is-flex-space-between has-margin-bottom-8">
      <span><i class="fa-fw has-margin-right-6" :class="iconClass" />{{ state.name }}<a v-if="state.isHistorized" class="has-margin-left-8 has-text-grey-light" title="Voir l'historique" @click="hasHistoryDisplayed = true"><i class="fa fa-fw fa-chart-area" /></a></span>
      <b-switch v-if="state.type==='boolean'" v-model="value" :disabled="!action" :true-value="1" :false-value="0" :title="state.name" class="has-margin-bottom-8" @input="action" />
      <div v-else-if="state.type === 'string' && action" lazy class="select has-margin-left-4" :title="state.name">
        <select v-model="value" @change="action">
          <option v-for="option in actionOptions" :key="option.value" :value="option.value">{{ option.label || option.value }}</option>
        </select>
      </div>
      <span v-else class="is-flex-space-between">
        <ul v-if="statistics" class="has-text-grey-light is-size-7 has-text-weight-light">
          <li class="statistics-item"><span class="has-padding-horizontal-8" title="Min">{{ statistics.min }}</span></li>
          <li class="statistics-item"><span class="has-padding-horizontal-8" title="Moyenne">{{ statistics.avg }}</span></li>
          <li class="statistics-item"><span class="has-padding-horizontal-8" title="Max">{{ statistics.max }}</span></li>
        </ul>
        <i v-if="statistics && statistics.trend !== null" class="fas fa-long-arrow-alt-right has-text-grey-light has-margin-horizontal-8" :class="trendClass" />
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
      const actionOn = actions.find((action) => action.stateFeedbackId === this.state.id && action.type === 'switch_on')
      const actionOff = actions.find((action) => action.stateFeedbackId === this.state.id && action.type === 'switch_off')
      const actionSwitch = actions.find((action) => action.stateFeedbackId === this.state.id && action.type === 'switch')
      const actionSelect = actions.find((action) => action.stateFeedbackId === this.state.id && action.type === 'select')
      if ((!actionOn || !actionOff) && !actionSwitch && !actionSelect) {
        return
      }
      const vm = this
      if (actionSwitch) {
        return async (newValue) => {
        // execute action with switch value
          vm.executeAction({ id: actionSwitch.id, options: { value: newValue } })
        }
      }
      if (actionSelect) {
        return async (newValue) => {
        // execute action with select value
          vm.executeAction({ id: actionSelect.id, options: { select: newValue.target.value } })
        }
      }
      return async (newValue) => {
        // execute action whose value is related to switch
        const actionId = newValue === 1 ? actionOn.id : actionOff.id
        vm.executeAction({ id: actionId })
      }
    },
    actionOptions () {
      // return possibles options for "select" typed action
      const actions = this.getActionsByEquipmentId(this.equipmentId)
      const actionSelect = actions.find((action) => action.stateFeedbackId === this.state.id && action.type === 'select')
      if (!actionSelect || !actionSelect.options) {
        return []
      }
      return actionSelect.options
    },
    statistics () { return this.getStateStatisticsById(this.id) },
    trendClass () {
      let trendClass = ''
      switch (this.statistics.trend) {
        case -2:
          trendClass = 'trend-down-strong'
          break
        case -1:
          trendClass = 'trend-down'
          break
        case 1:
          trendClass = 'trend-up'
          break
        case 2:
          trendClass = 'trend-up-strong'
          break
      }
      return trendClass
    },
  },
  created () {
    if (this.state.isHistorized && this.state.type === 'numeric') {
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
.trend-up {
  transform: rotate(-20deg);
}
.trend-up-strong {
  transform: rotate(-40deg);
}
.trend-down {
  transform: rotate(20deg);
}
.trend-down-strong {
  transform: rotate(40deg);
}
</style>
