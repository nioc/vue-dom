<template>
  <div>
    <div class="is-flex-space-between mb-2">
      <span class="is-flex is-align-items-center"><i class="fa-fw mr-4" :class="iconClass" /><span class="info-label">{{ label || state.name }}</span><a v-if="state.isHistorized" class="ml-2 has-text-grey-light" title="Voir l'historique" @click="hasHistoryDisplayed = true"><i class="fa fa-fw fa-chart-area" /></a></span>
      <o-switch v-if="state.type==='boolean'" v-model="value" :disabled="!action" :title="state.name" class="mr-0" position="left" @update:model-value="action" />
      <o-slider v-else-if="state.type === 'numeric' && action" v-model="value" lazy class="ml-5 my-2" :title="state.name" :min="action.minValue" :max="action.maxValue" :tooltip="false" indicator rounded @change="action.f" />
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
        <span class="has-text-weight-semi-bold info-value" :class="{'has-text-danger': state.isTooHigh || state.isTooLow}">{{ state.currentValue }}<span class="has-text-weight-light">{{ unit }}</span></span>
      </span>
    </div>
    <div v-if="hasHistoryDisplayed" class="message is-light">
      <div class="message-header is-size-7">
        Historique
        <button class="delete" title="Fermer" @click="hasHistoryDisplayed = false" />
      </div>
      <div class="message-body mb-3 p-2">
        <history :series="series" />
      </div>
    </div>
  </div>
</template>

<script>
import { useDataStore } from '@/store/data'
import { useEquipmentsHelper } from '@/composables/useEquipmentsHelper'
import { dtFormat, durParse, dtFormatDuration } from '@/services/Datetime.js'
import History from '@/components/History.vue'

export default {
  name: 'Info',
  components: {
    History,
  },
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
  setup() {
    const dataStore = useDataStore()
    const { getIconClass } = useEquipmentsHelper()
    return { dataStore, getIconClass }
  },
  data () {
    return {
      hasHistoryDisplayed: false,
    }
  },
  computed: {
    state () {
      return this.dataStore.getStateById(this.id)
    },
    value: {
      // computed to avoid mutation
      get: function () {
        return this.state.currentValue
      },
      set: () => {},
    },
    iconClass () {
      return this.getIconClass(this.state)
    },
    unit () {
      return this.state.unit ? ' ' + this.state.unit : ''
    },
    datetimeFormattedValue () {
      switch (this.state.type) {
        case 'datetime':
          return dtFormat(this.state.currentValue, 'PPPp')
        case 'date':
          return dtFormat(this.state.currentValue, 'PPP')
        case 'time':
          return dtFormat(this.state.currentValue, 'p')
        case 'duration': {
          try {
            if (this.state.currentValue === 'P0D') {
              return 'nulle'
            }
            const duration = durParse(this.state.currentValue)
            let result = ''
            const units = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds']
            for (let index = 0; index < units.length; index++) {
              const mainUnit = units[index]
              const durationMainUnit = duration[mainUnit]
              if (durationMainUnit === undefined) {
                // no value for this unit
                continue
              }
              result = dtFormatDuration(duration, { format: [mainUnit] })
              if (index < units.length) {
                const detailUnit = units[index + 1]
                const durationDetailUnit = duration[detailUnit]
                if (durationDetailUnit !== undefined) {
                  result += ` ${dtFormatDuration(duration, { format: [detailUnit] })}`
                }
              }
              break
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
      const actions = this.dataStore.getActionsByEquipmentId(this.equipmentId)
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
          vm.dataStore.vxExecuteAction({ id: actionSwitch.id, options: { value: newValue } })
        }
      }
      if (actionSelect) {
        return async (newValue) => {
          // execute action with select value
          vm.dataStore.vxExecuteAction({ id: actionSelect.id, options: { select: newValue.target.value } })
        }
      }
      if (actionSlider) {
        const action = this.dataStore.getActionById(actionSlider.id)
        return {
          minValue: action.minValue,
          maxValue: action.maxValue,
          f: async (newValue) => {
            // execute action with slider value
            vm.dataStore.vxExecuteAction({ id: actionSlider.id, options: { slider: newValue } })
          },
        }
      }
      return async (newValue) => {
        // execute action whose value is related to switch
        const actionId = newValue ? actionOn.id : actionOff.id
        vm.dataStore.vxExecuteAction({ id: actionId })
      }
    },
    actionOptions () {
      // return possibles options for "select" typed action
      const actions = this.dataStore.getActionsByEquipmentId(this.equipmentId)
      const actionSelect = actions.find((action) => action.stateFeedbackId === this.state.id && action.type === 'select')
      if (!actionSelect || !actionSelect.options) {
        return []
      }
      return actionSelect.options
    },
    statistics () {
      return this.dataStore.getStateStatisticsById(this.id)
    },
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
    series () {
      return [{
        id: this.state.id,
        name: this.state.name,
        dataType: this.state.type,
      }]
    },
  },
  created () {
    if (this.state.isHistorized && this.state.type === 'numeric') {
      this.dataStore.vxLoadStateStatistics(this.state.id)
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
