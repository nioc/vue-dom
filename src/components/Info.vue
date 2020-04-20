<template>
  <div>
    <div class="is-flex-space-between has-margin-bottom-8">
      <span><i class="fa-fw has-margin-right-6" :class="iconClass" />{{ cmd.name }}<a v-if="cmd.isHistorized === '1'" class="has-margin-left-8 has-text-grey-light" title="Voir l'historique" @click="hasHistoryDisplayed = true"><i class="fa fa-fw fa-chart-area" /></a></span>
      <b-switch v-if="cmd.subType==='binary'" v-model="value" :disabled="!action" true-value="1" :title="cmd.name" class="has-margin-bottom-8" @input="action" />
      <span v-else class="is-flex-space-between">
        <ul v-if="statistics" class="has-text-grey-light is-size-7 has-text-weight-light">
          <li class="statistics-item"><span class="has-padding-horizontal-8" title="Min">{{ statistics.min }}</span></li>
          <li class="statistics-item"><span class="has-padding-horizontal-8" title="Moyenne">{{ statistics.avg }}</span></li>
          <li class="statistics-item"><span class="has-padding-horizontal-8" title="Max">{{ statistics.max }}</span></li>
        </ul>
        <span class="has-text-weight-semi-bold">{{ cmd.currentValue }}{{ unit }}</span>
      </span>
    </div>
    <div v-if="hasHistoryDisplayed" class="message is-light">
      <div class="message-header is-size-7">
        Historique
        <button class="delete" title="Fermer" @click="hasHistoryDisplayed = false" />
      </div>
      <div class="message-body has-margin-bottom-7 has-padding-8">
        <history :id="cmd.id" :name="cmd.name" />
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
    eqLogicId: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      hasHistoryDisplayed: false,
    }
  },
  computed: {
    cmd () { return this.getCmdById(this.id) },
    value: {
      // computed to avoid vuex mutation
      get: function () { return this.cmd.currentValue },
      set: () => {},
    },
    iconClass () { return this.getIconClass(this.cmd) },
    unit () { return this.cmd.unit ? ' ' + this.cmd.unit : '' },
    action () {
      const cmds = this.getCmdsByEqLogicId(this.eqLogicId)
      const cmdValue = '#' + this.cmd.id + '#'
      const cmdOn = cmds.find((c) => c.value === cmdValue && c.genericType === 'LIGHT_ON')
      const cmdOff = cmds.find((c) => c.value === cmdValue && c.genericType === 'LIGHT_OFF')
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
