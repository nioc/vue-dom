<template>
  <div>
    <info v-for="state in attributes.states" :id="state" :key="state" :equipment-id="equipment.id" />
    <div v-if="attributes.actions.length > 0" class="is-flex-space-between has-margin-bottom-8">
      <span><i class="fa-fw fa fa-tools has-margin-right-6" />Actions</span>
      <span class="buttons is-right has-addons is-flex-grow">
        <action v-for="action in attributes.actions" :id="action" :key="action" />
      </span>
    </div>
  </div>
</template>

<script>
import Action from '@/components/Action'
import Info from '@/components/Info'
import { CmdMixin } from '@/mixins/Cmd'
import { createNamespacedHelpers } from 'vuex'
const { mapGetters } = createNamespacedHelpers('data')

export default {
  components: {
    Action,
    Info,
  },
  mixins: [CmdMixin],
  props: {
    equipment: {
      type: Object,
      required: true,
    },
  },
  computed: {
    attributes: function () {
      const actionsList = []
      const actionsHiddenList = []
      const statesList = []
      const actions = this.getActionsByIds(this.equipment.actions).filter((action) => action.isVisible)
      this.getStatesByIds(this.equipment.states).filter((state) => state.isVisible).forEach(state => {
        if (state.type === 'binary') {
          // search for light switch on/off
          const actionOn = actions.find((action) => action.stateFeedbackId === state.id && action.genericType === 'LIGHT_ON')
          const actionOff = actions.find((action) => action.stateFeedbackId === state.id && action.genericType === 'LIGHT_OFF')
          if (actionOn && actionOff) {
            // do not display button for on/off actions
            actionsHiddenList.push(actionOn.id, actionOff.id)
          }
          statesList.push(state.id)
        } else if (state.type === 'numeric') {
          if (!actions.find((action) => action.stateFeedbackId === state.id && action.genericType === 'LIGHT_SLIDER')) {
            // do not display slider state
            statesList.push(state.id)
          }
        } else if (state.type === 'string') {
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
    ...mapGetters(['getEquipmentById']),
  },
}
</script>
