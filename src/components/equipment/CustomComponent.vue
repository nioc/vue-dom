<template>
  <component :is="component" :equipment="equipment" />
</template>

<script>
import LoadingComponent from '@/components/equipment/LoadingComponent'
const customComponents = window.custom.components

export default {
  components: Object.keys(customComponents).reduce((components, moduleName) => {
    const componentName = customComponents[moduleName]
    return Object.assign(components, {
      [componentName]: () => ({
        component: import(/* webpackChunkName: "[request]" */ '@/components/equipment/' + componentName),
        loading: LoadingComponent,
        delay: 0,
      }),
    })
  }, {}),
  props: {
    equipment: {
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
