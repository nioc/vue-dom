<template>
  <component :is="component" :eq-logic="eqLogic" />
</template>

<script>
import LoadingComponent from '@/components/eqLogic/LoadingComponent'
const customComponents = window.custom.components

export default {
  components: Object.keys(customComponents).reduce((components, moduleName) => {
    const componentName = customComponents[moduleName]
    return Object.assign(components, {
      [componentName]: () => ({
        component: import(/* webpackChunkName: "[request]" */ '@/components/eqLogic/' + componentName),
        loading: LoadingComponent,
        delay: 0,
      }),
    })
  }, {}),
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
