<template>
  <div>
    <info v-for="state in attributes.states" :id="state" :key="state" :equipment-id="equipment.id" />
    <div v-if="attributes.actions.length > 0" class="is-flex-space-between mb-2">
      <span><i class="fa-fw fa fa-tools mr-4" />Actions</span>
      <span class="buttons is-right has-addons is-flex-grow">
        <action v-for="action in attributes.actions" :id="action" :key="action" />
      </span>
    </div>
  </div>
</template>

<script>
import Action from '@/components/Action.vue'
import Info from '@/components/Info.vue'
import { useDataStore } from '@/store/data'

export default {
  name: 'GenericEquipment',
  components: {
    Action,
    Info,
  },
  props: {
    equipment: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const dataStore = useDataStore()
    return { dataStore }
  },
  computed: {
    attributes: function () {
      const actionsList = []
      const actionsHiddenList = []
      const statesList = []
      const actions = this.dataStore.getActionsByIds(this.equipment.actions).filter((action) => action.isVisible)
      this.dataStore.getStatesByIds(this.equipment.states).filter((state) => state.isVisible).forEach(state => {
        if (state.type === 'boolean') {
          // search for switch and on/off actions
          const actionOn = actions.find((action) => action.stateFeedbackId === state.id && action.type === 'switch_on')
          const actionOff = actions.find((action) => action.stateFeedbackId === state.id && action.type === 'switch_off')
          const actionSwitch = actions.find((action) => action.stateFeedbackId === state.id && action.type === 'switch')
          if (actionOn && actionOff) {
            // do not display button for on/off actions
            actionsHiddenList.push(actionOn.id, actionOff.id)
          }
          if (actionSwitch) {
            // do not display button for switch actions
            actionsHiddenList.push(actionSwitch.id)
          }
          statesList.push(state.id)
        } else if (state.type === 'numeric') {
          const actionSlider = actions.find((action) => action.stateFeedbackId === state.id && action.type === 'slider')
          if (actionSlider) {
            // do not display slider action
            actionsHiddenList.push(actionSlider.id)
          }
          statesList.push(state.id)
        } else if (state.type === 'string') {
          // search for select action
          const actionSelect = actions.find((action) => action.stateFeedbackId === state.id && action.type === 'select')
          if (actionSelect) {
            // do not display dropdown for select actions
            actionsHiddenList.push(actionSelect.id)
          }
          statesList.push(state.id)
        } else if (state.type === 'datetime' || state.type === 'date' || state.type === 'time' || state.type === 'duration') {
          statesList.push(state.id)
        }
      })
      // set visible actions
      actions.forEach(cmd => {
        if (!actionsHiddenList.includes(cmd.id)) {
          actionsList.push(cmd.id)
        }
      })
      return { states: statesList, actions: actionsList }
    },
  },
}
</script>
