<template>
  <b-switch v-if="cmd.subType==='binary'" v-model="value" :disabled="!action" true-value="1" :title="cmd.name" @input="action" />
  <div v-else>
    <i class="fa-fw" :class="iconClass" />{{ cmd.name }}
    <ul v-if="statistics" class="has-text-grey-light is-size-7 has-text-weight-light is-inline">
      <li class="statistics-item"><span class="has-padding-horizontal-8" title="Min">{{ statistics.min }}</span></li>
      <li class="statistics-item"><span class="has-padding-horizontal-8" title="Moyenne">{{ statistics.avg }}</span></li>
      <li class="statistics-item"><span class="has-padding-horizontal-8" title="Max">{{ statistics.max }}</span></li>
    </ul>
    <span class="has-text-weight-semi-bold">{{ cmd.currentValue }}{{ unit }}</span>
  </div>
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
    statistics () { return this.getCmdStatisticsById(this.id) },
  },
  created () {
    if (this.cmd.isHistorized === '1' && this.cmd.subType !== 'binary') {
      this.loadCmdStatistics(this.cmd.id)
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
</style>
