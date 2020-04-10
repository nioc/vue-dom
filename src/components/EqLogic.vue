<template>
  <article class="card has-margin-bottom-6">
    <header class="card-header">
      <p class="card-header-title">{{ eqLogic.name }}</p>
      <span class="card-header-icon"><span v-if="eqLogicBattery">{{ eqLogicBattery.currentValue }}%<i class="fa-ml" :class="eqLogicBattery.iconClass" /></span></span>
    </header>
    <component :is="getEqLogicComponent(eqLogic.eqType_name)" v-if="isEqLogicHandled(eqLogic.eqType_name)" :eq-logic="eqLogic" class="card-content" />
    <div v-else class="card-content">
      <info v-for="cmd in cmds.infos" :id="cmd" :key="cmd" :eq-logic-id="eqLogic.id" />
      <div class="buttons has-addons has-margin-top-6">
        <action v-for="cmd in cmds.actions" :id="cmd" :key="cmd" />
      </div>
    </div>
  </article>
</template>

<script>
import Action from '@/components/Action'
import Info from '@/components/Info'
import { mapGetters } from 'vuex'
import { CmdMixin } from '@/mixins/Cmd'

export default {
  components: {
    Action,
    Info,
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
