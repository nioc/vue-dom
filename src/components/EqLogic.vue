<template>
  <article class="card has-margin-bottom-6">
    <header class="card-header">
      <p class="card-header-title">{{ eqLogic.name }}</p>
      <aside class="card-header-icon is-size-7-mobile">
        <span v-if="eqLogicBattery" class="has-text-grey"><i class="fa-mr" :class="eqLogicBattery.iconClass" />{{ eqLogicBattery.currentValue }}%</span>
        <span v-if="eqLogic.status.lastCommunication" :title="eqLogic.status.lastCommunication | moment('LLLL')" class="has-text-grey has-margin-left-8"><i class="fa-mr far fa-clock" /><time-ago :date="eqLogic.status.lastCommunication" :drop-fixes="true" /></span>
      </aside>
    </header>
    <component :is="getEqLogicComponent(eqLogic.eqType_name)" v-if="isEqLogicHandled(eqLogic.eqType_name)" :eq-logic="eqLogic" class="card-content" />
    <div v-else class="card-content">
      <info v-for="cmd in cmds.infos" :id="cmd" :key="cmd" :eq-logic-id="eqLogic.id" />
      <div v-if="cmds.actions.length > 0" class="is-flex-space-between has-margin-bottom-8">
        <span><i class="fa-fw fa fa-tools has-margin-right-6" />Actions</span>
        <span class="buttons is-right has-addons">
          <action v-for="cmd in cmds.actions" :id="cmd" :key="cmd" />
        </span>
      </div>
    </div>
  </article>
</template>

<script>
import Action from '@/components/Action'
import Info from '@/components/Info'
import TimeAgo from '@/components/TimeAgo'
import { createNamespacedHelpers } from 'vuex'
import { CmdMixin } from '@/mixins/Cmd'
const { mapGetters } = createNamespacedHelpers('data')

export default {
  components: {
    Action,
    Info,
    TimeAgo,
  },
  mixins: [CmdMixin],
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      isLoaded: false,
      actions: [],
      infos: [],
    }
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
    cmds: function () {
      const actionsList = []
      const actionsHiddenList = []
      const infosList = []
      const cmds = this.getCmdsByEqLogicId(this.id)
      cmds.forEach(cmd => {
        if (cmd.type === 'info') {
          const cmdValue = '#' + cmd.id + '#'
          if (cmd.subType === 'binary') {
            // search for light switch on/off
            const cmdOn = cmds.find((c) => c.value === cmdValue && c.generic_type === 'LIGHT_ON')
            const cmdOff = cmds.find((c) => c.value === cmdValue && c.generic_type === 'LIGHT_OFF')
            if (cmdOn && cmdOff) {
              // do not display button for on/off actions
              actionsHiddenList.push(cmdOn.id, cmdOff.id)
            }
            infosList.push(cmd.id)
          } else if (cmd.subType === 'numeric') {
            if (!cmds.find((c) => c.value === cmdValue && c.generic_type === 'LIGHT_SLIDER')) {
              // do not display slider value info
              infosList.push(cmd.id)
            }
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
  methods: {
    getEqLogicComponent (eqType) {
      switch (eqType) {
        default:
          return 'Generic'
      }
    },
    isEqLogicHandled (eqType) {
      switch (eqType) {
        default:
          return false
      }
    },
  },
}
</script>
