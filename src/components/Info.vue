<template>
  <div>
    <div class="is-flex-space-between mb-2">
      <span class="is-flex is-align-items-center"><i class="fa-fw mr-4" :class="iconClass" /><span class="info-label">{{ label || state.name }}</span><a v-if="state.isHistorized" class="ml-2 has-text-grey-light" title="Voir l'historique" @click="hasHistoryDisplayed = true"><i class="fa fa-fw fa-chart-area" /></a></span>
      <b-switch v-if="state.type==='boolean'" v-model="value" :disabled="!action" :title="state.name" :left-label="true" class="mr-0" @input="action" />
      <b-slider v-else-if="state.type === 'numeric' && action" v-model="value" lazy class="ml-5 my-2" :title="state.name" :min="action.minValue" :max="action.maxValue" :tooltip="false" indicator rounded @change="action.f" />
      <span v-else-if="datetimeFormattedValue" class="is-flex-space-between">
        <span class="has-text-weight-semi-bold info-value" :class="{'has-text-danger': state.isTooHigh || state.isTooLow}">{{ datetimeFormattedValue }}</span>
      </span>
      <div v-else-if="state.type === 'string' && action" lazy class="select ml-5" :title="state.name">
        <select v-model="value" @change="action">
          <option v-for="option in actionOptions" :key="option.value" :value="option.value">{{ option.label || option.value }}</option>
        </select>
      </div>
      <span v-else class="is-flex-space-between">
        <ul v-if="statistics" class="has-text-grey-light is-size-7 has-text-weight-light">
          <li class="statistics-item"><span class="statistics-item-min" title="Min">{{ statistics.min }}</span></li>
          <li class="statistics-item"><span class="statistics-item-mean" title="Moyenne">{{ statistics.avg }}</span></li>
          <li class="statistics-item"><span class="statistics-item-max" title="Max">{{ statistics.max }}</span></li>
        </ul>
        <i v-if="statistics && statistics.trend !== null" class="fas fa-long-arrow-alt-right has-text-grey-light mx-2" :class="trendClass" />
        <i v-if="state.genericType === 'WIND_DIRECTION'" class="fa fa-location-arrow mr-2" :style="`transform: rotate(${135+parseInt(state.currentValue)}deg);`" />
        <span class="has-text-weight-semi-bold info-value" :class="{'has-text-danger': state.isTooHigh || state.isTooLow}">{{ state.currentValue }}{{ unit }}</span>
      </span>
    </div>
    <div v-if="hasHistoryDisplayed" class="message is-light">
      <div class="message-header is-size-7">
        Historique
        <button class="delete" title="Fermer" @click="hasHistoryDisplayed = false" />
      </div>
      <div class="message-body mb-3 p-2">
        <history :id="state.id" :name="state.name" :has-steps="state.type === 'boolean'" />
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
    label: {
      type: String,
      default: null,
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
    datetimeFormattedValue () {
      switch (this.state.type) {
        case 'datetime':
          return this.$moment(this.state.currentValue).format('LLL')
        case 'date':
          return this.$moment(this.state.currentValue).format('LL')
        case 'time':
          return this.$moment(this.state.currentValue).format('LT')
        case 'duration': {
          try {
            if (this.state.currentValue === 'P0D') {
              return 'nulle'
            }
            const duration = this.$moment.duration(this.state.currentValue)
            let result = ''
            const units = ['y', 'M', 'd', 'h', 'm', 's']
            const thresholds = { M: 30, d: 7, h: 24, m: 60, s: 60 }
            for (let index = 0; index < units.length; index++) {
              const mainUnit = units[index]
              const durationMainUnit = duration.get(mainUnit)
              if (durationMainUnit !== 0) {
                result = this.$moment.duration(durationMainUnit, mainUnit).humanize(thresholds)
                if (index < units.length) {
                  const detailUnit = units[index + 1]
                  const durationDetailUnit = duration.get(detailUnit)
                  if (durationDetailUnit !== 0) {
                    result += ` ${this.$moment.duration(durationDetailUnit, detailUnit).humanize(thresholds)}`
                  }
                }
                break
              }
            }
            return result
          } catch (error) {
            console.log(error)
            return this.state.currentValue
          }
        }
        default:
          return null
      }
    },
    action () {
      const actions = this.getActionsByEquipmentId(this.equipmentId)
      const actionOn = actions.find((action) => action.stateFeedbackId === this.state.id && action.type === 'switch_on')
      const actionOff = actions.find((action) => action.stateFeedbackId === this.state.id && action.type === 'switch_off')
      const actionSwitch = actions.find((action) => action.stateFeedbackId === this.state.id && action.type === 'switch')
      const actionSelect = actions.find((action) => action.stateFeedbackId === this.state.id && action.type === 'select')
      const actionSlider = actions.find((action) => action.stateFeedbackId === this.state.id && action.type === 'slider')
      if ((!actionOn || !actionOff) && !actionSwitch && !actionSelect && !actionSlider) {
        return
      }
      const vm = this
      if (actionSwitch) {
        return async (newValue) => {
          // execute action with switch value
          vm.vxExecuteAction({ id: actionSwitch.id, options: { value: newValue } })
        }
      }
      if (actionSelect) {
        return async (newValue) => {
          // execute action with select value
          vm.vxExecuteAction({ id: actionSelect.id, options: { select: newValue.target.value } })
        }
      }
      if (actionSlider) {
        const action = this.getActionById(actionSlider.id)
        return {
          minValue: action.minValue,
          maxValue: action.maxValue,
          f: async (newValue) => {
            // execute action with slider value
            vm.vxExecuteAction({ id: actionSlider.id, options: { slider: newValue } })
          },
        }
      }
      return async (newValue) => {
        // execute action whose value is related to switch
        const actionId = newValue ? actionOn.id : actionOff.id
        vm.vxExecuteAction({ id: actionId })
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
      this.vxLoadStateStatistics(this.state.id)
    }
  },
}
</script>
<style>
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
