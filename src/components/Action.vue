<template>
  <button v-if="cmd.subType === 'other'" class="button is-rounded" @click="action">
    <span class="icon"><i :class="iconClass" /></span><span>{{ cmd.name }}</span>
  </button>
  <b-slider v-else-if="cmd.subType === 'slider'" v-model="value" lazy @change="actionSlider" />
  <span v-else>{{ cmd }}</span>
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
  },
  computed: {
    value: {
      get: function () { return this.cmd.currentValue },
      set: () => {},
    },
    cmd () { return this.getCmdById(this.id) },
    iconClass () { return this.getIconClass(this.cmd) },
  },
  methods: {
    action: function () {
      this.execCmd({ id: this.cmd.id })
    },
    actionSlider: function (newValue) {
      this.execCmd({ id: this.cmd.id, options: { slider: newValue } })
    },
  },
}
</script>
