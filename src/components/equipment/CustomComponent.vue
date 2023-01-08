<template>
  <component :is="component" :equipment="equipment" />
</template>

<script>
import { defineAsyncComponent } from 'vue'
import LoadingComponent from '@/components/equipment/LoadingComponent.vue'
const customComponents = window.custom.components

export default {
  name: 'CustomEquipment',
  components: Object.keys(customComponents).reduce((components, moduleName) => {
    const componentName = customComponents[moduleName]
    return Object.assign(components, {
      [componentName]: defineAsyncComponent({
        loader: () => import(`./${componentName}/index.vue`),
        loadingComponent: LoadingComponent,
        delay: 250,
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
