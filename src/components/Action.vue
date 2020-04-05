<template>
  <button v-if="cmd.subType === 'other'" class="button is-rounded" @click="action">
    <span class="icon"><i class="fa" :class="iconClass" /></span><span>{{ cmd.name }}</span>
  </button>
  <b-slider v-else-if="cmd.subType === 'slider'" v-model="value" lazy @change="actionSlider" />
  <span v-else>{{ cmd }}</span>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
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
    cmd () { return this.cmdById(this.id) },
    iconClass () {
      switch (this.cmd.logicalId) {
        case 'refresh':
          return 'fa-refresh'
        case 'wol':
          return 'fa-flash'
      }
      switch (this.cmd.generic_type) {
        case 'FLAP_DOWN':
          return 'fa-arrow-down'
        case 'FLAP_STOP':
          return 'fa-stop'
        case 'FLAP_UP':
          return 'fa-arrow-up'
        default:
          return 'fa-arrow-up'
      }
    },
    ...mapGetters(['cmdById']),
  },
  methods: {
    action: function () {
      this.execCmd({ id: this.cmd.id })
    },
    actionSlider: function (newValue) {
      this.execCmd({ id: this.cmd.id, options: { slider: newValue } })
    },
    ...mapActions(['execCmd']),
  },
}
</script>
