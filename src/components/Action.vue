<template>
  <button v-if="action.type === 'button'" class="button is-rounded is-primary is-light" :title="action.name" @click="execute">
    <span class="icon is-icon-mobile"><i :class="iconClass" /></span><span class="is-hidden-mobile">{{ action.name }}</span>
  </button>
  <o-slider v-else-if="action.type === 'slider'" v-model="value" lazy class="ml-5 mt-2" :title="action.name" :min="action.minValue" :max="action.maxValue" :tooltip="false" indicator rounded @change="actionSlider" />
  <div v-else-if="action.type === 'select'" lazy class="select ml-5 mt-2" :title="action.name">
    <select v-model="value" @change="actionSelect">
      <option v-for="option in action.options" :key="option.value" :value="option.value">{{ option.label || option.value }}</option>
    </select>
  </div>
  <o-switch v-else-if="action.type === 'switch'" v-model="value" :title="action.name" class="mb-2" @update:model-value="actionSwitch" />
  <span v-else>{{ action }}</span>
</template>

<script>
import { useDataStore } from '@/store/data'
import { useEquipmentsHelper } from '@/composables/useEquipmentsHelper'

export default {
  name: 'Action',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup() {
    const dataStore = useDataStore()
    const { getIconClass, checkConfirmAndExecuteAction } = useEquipmentsHelper()
    return { dataStore, getIconClass, checkConfirmAndExecuteAction }
  },
  computed: {
    value: {
      get: function () {
        if (Object.prototype.hasOwnProperty.call(this.action, 'currentValue')) {
          return this.action.currentValue
        }
        const stateFeedback = this.dataStore.getStateById(this.action.stateFeedbackId)
        return stateFeedback.currentValue
      },
      set: () => {},
    },
    action () {
      return this.dataStore.getActionById(this.id)
    },
    iconClass () {
      return this.getIconClass(this.action)
    },
  },
  methods: {
    execute: function () {
      this.checkConfirmAndExecuteAction(this.action, { id: this.action.id })
    },
    actionSlider: function (newValue) {
      this.dataStore.vxExecuteAction({ id: this.action.id, options: { slider: newValue } })
    },
    actionSelect: function (newValue) {
      this.dataStore.vxExecuteAction({ id: this.action.id, options: { select: newValue.target.value } })
    },
    actionSwitch: function (newValue) {
      this.dataStore.vxExecuteAction({ id: this.action.id, options: { params: { value: newValue } } })
    },
  },
}
</script>
