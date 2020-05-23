<template>
  <div>
    <info v-for="cmd in cmds.infos" :id="cmd" :key="cmd" :eq-logic-id="eqLogic.id" />
    <div v-if="cmds.actions.length > 0" class="is-flex-space-between has-margin-bottom-8">
      <span><i class="fa-fw fa fa-tools has-margin-right-6" />Actions</span>
      <span class="buttons is-right has-addons is-flex-grow">
        <action v-for="cmd in cmds.actions" :id="cmd" :key="cmd" />
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
    eqLogic: {
      type: Object,
      required: true,
    },
  },
  computed: {
    cmds: function () {
      const actionsList = []
      const actionsHiddenList = []
      const infosList = []
      const cmds = this.getCmdsByIds(this.eqLogic.cmds)
      cmds.forEach(cmd => {
        if (cmd.type === 'info') {
          const cmdValue = '#' + cmd.id + '#'
          if (cmd.subType === 'binary') {
            // search for light switch on/off
            const cmdOn = cmds.find((c) => c.value === cmdValue && c.genericType === 'LIGHT_ON')
            const cmdOff = cmds.find((c) => c.value === cmdValue && c.genericType === 'LIGHT_OFF')
            if (cmdOn && cmdOff) {
              // do not display button for on/off actions
              actionsHiddenList.push(cmdOn.id, cmdOff.id)
            }
            infosList.push(cmd.id)
          } else if (cmd.subType === 'numeric') {
            if (!cmds.find((c) => c.value === cmdValue && c.genericType === 'LIGHT_SLIDER')) {
              // do not display slider value info
              infosList.push(cmd.id)
            }
          } else if (cmd.subType === 'string') {
            infosList.push(cmd.id)
          }
        }
      })
      // set visible action commands
      cmds.forEach(cmd => {
        if (cmd.type === 'action' && !actionsHiddenList.includes(cmd.id)) {
          actionsList.push(cmd.id)
        }
      })
      return { infos: infosList, actions: actionsList }
    },
    ...mapGetters(['getEqLogicById']),
  },
}
</script>
