<template>
  <div class="mb-3">
    <span class="is-flex is-justify-content-space-between">
      <span :title="labelTitle">{{ label }}</span>
      <span class="has-text-weight-semi-bold">{{ humanValueCalc }}</span>
    </span>
    <progress class="progress" :class="colorClass" :value="value" :max="max" :title="percent + ' %'">{{ percent }} %</progress>
  </div>
</template>

<script>

export default {
  name: 'SystemMetric',
  props: {
    label: {
      type: String,
      required: true,
    },
    labelTitle: {
      type: String,
      default: null,
    },
    value: {
      type: Number,
      required: true,
    },
    humanValue: {
      type: String,
      default: undefined,
    },
    max: {
      type: Number,
      default: 100,
    },
    type: {
      type: String,
      default: null,
    },
    warningThreshold: {
      type: Number,
      default: 60,
    },
    dangerThreshold: {
      type: Number,
      default: 80,
    },
  },
  computed: {
    percent () { return Math.round(100 * this.value / this.max) },
    humanValueCalc () { return this.humanValue || this.value.toString() },
    colorClass () {
      if (this.type) {
        return this.type
      }
      if (this.percent >= this.dangerThreshold) {
        return 'is-danger'
      }
      if (this.percent >= this.warningThreshold) {
        return 'is-warning'
      }
      return 'is-success'
    },
  },
}
</script>
