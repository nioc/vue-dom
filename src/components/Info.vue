<template>
  <b-switch v-if="cmd.subType==='binary'" v-model="value" :disabled="!action" true-value="1" :title="cmd.name" @input="action" />
  <div v-else><i class="fa fa-fw" :class="iconClass" />{{ cmd.name }} : {{ cmd.currentValue }} {{ cmd.unite }}</div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
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
    cmd () { return this.cmdById(this.id) },
    value: {
      // computed to avoid vuex mutation
      get: function () { return this.cmd.currentValue },
      set: () => {},
    },
    iconClass () {
      switch (this.cmd.generic_type) {
        case 'HUMIDITY':
        case 'RAIN_CURRENT':
          return 'fa-tint'
        case 'TEMPERATURE':
          return 'fa-thermometer-half'
        case 'CO2':
          return 'fa-bullseye'
        case 'VOLTAGE':
        case 'POWER':
          return 'fa-bolt'
      }
      return 'fa-question'
    },
    action () {
      const cmds = this.cmdsByEqLogicId(this.eqLogicId)
      const cmdValue = '#' + this.cmd.id + '#'
      const cmdOn = cmds.find((c) => c.value === cmdValue && c.generic_type === 'LIGHT_ON')
      const cmdOff = cmds.find((c) => c.value === cmdValue && c.generic_type === 'LIGHT_OFF')
      if (!cmdOn || !cmdOff) {
        return
      }
      const vm = this
      return async (newValue) => {
        const cmdId = newValue === '1' ? cmdOn.id : cmdOff.id
        try {
          await vm.$JeedomApi.cmd(cmdId)
        } catch (error) {
          console.error(error)
          this.setInformation({ message: error.message, type: 'is-danger' })
        }
      }
    },
    ...mapGetters(['cmdById', 'cmdsByEqLogicId']),
  },
  methods: {
    ...mapMutations(['setInformation']),
  },
}
</script>
