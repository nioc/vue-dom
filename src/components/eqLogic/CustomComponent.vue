<template>
  <component :is="component" :eq-logic="eqLogic" />
</template>

<script>

export default {
  components: {
  },
  props: {
    eqLogic: {
      type: Object,
      required: true,
    },
    component: {
      type: String,
      required: true,
    },
  },
}
</script>
