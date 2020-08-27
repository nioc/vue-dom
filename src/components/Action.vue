<template>
  <button v-if="action.type === 'button'" class="button is-rounded is-primary is-light" :title="action.name" @click="execute">
    <span class="icon is-icon-mobile"><i :class="iconClass" /></span><span class="is-hidden-mobile">{{ action.name }}</span>
  </button>
  <b-slider v-else-if="action.type === 'slider'" v-model="value" lazy class="has-margin-left-4 has-margin-top-8" :title="action.name" @change="actionSlider" />
  <span v-else>{{ action }}</span>
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
      get: function () { return this.action.currentValue },
      set: () => {},
    },
    action () { return this.getActionById(this.id) },
    iconClass () { return this.getIconClass(this.action) },
  },
  methods: {
    execute: function () {
      this.executeAction({ id: this.action.id })
    },
    actionSlider: function (newValue) {
      this.executeAction({ id: this.action.id, options: { slider: newValue } })
    },
  },
}
</script>
