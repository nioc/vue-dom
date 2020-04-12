<template>
  <b-switch v-if="cmd.subType==='binary'" v-model="value" :disabled="!action" true-value="1" :title="cmd.name" @input="action" />
  <div v-else><i class="fa-fw" :class="iconClass" />{{ cmd.name }} : {{ cmd.currentValue }}{{ unit }}</div>
</template>

<script>
import { CmdMixin } from '@/mixins/Cmd'
export default {
  mixins: [CmdMixin],
  props: {
    id: {
      type: String,
      required: true,
    },
    eqLogicId: {
      type: String,
      required: true,
    },
  },
  computed: {
    cmd () { return this.getCmdById(this.id) },
    value: {
      // computed to avoid vuex mutation
      get: function () { return this.cmd.currentValue },
      set: () => {},
    },
    iconClass () { return this.getIconClass(this.cmd) },
    unit () { return this.cmd.unite ? ' ' + this.cmd.unite : '' },
    action () {
      const cmds = this.getCmdsByEqLogicId(this.eqLogicId)
      const cmdValue = '#' + this.cmd.id + '#'
      const cmdOn = cmds.find((c) => c.value === cmdValue && c.generic_type === 'LIGHT_ON')
      const cmdOff = cmds.find((c) => c.value === cmdValue && c.generic_type === 'LIGHT_OFF')
      if (!cmdOn || !cmdOff) {
        return
      }
      const vm = this
      return async (newValue) => {
        const cmdId = newValue === '1' ? cmdOn.id : cmdOff.id
        vm.execCmd({ id: cmdId })
      }
    },
  },
}
</script>
