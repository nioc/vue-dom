<template>
  <article class="card mb-4">
    <header class="card-header">
      <p class="card-header-title">{{ equipment.name }}<router-link v-if="hasRole('admin')" :to="{name: 'admin-equipment', params: {id: equipment.id}}" title="Gérer l'équipement"><i class="fas ml-2 fa-sm fa-tools has-text-grey-light" /></router-link></p>
      <aside class="card-header-icon is-size-7-mobile">
        <span v-if="equipment.battery" :class="[equipment.hasLowBattery ? 'has-text-danger' : 'has-text-grey']"><i class="fa-mr" :class="getBatteryLevelIconClass(equipment.battery)" />{{ equipment.battery }}%</span>
        <span v-if="equipment.lastCommunication" :title="equipment.lastCommunication | moment('LLLL')" :class="[equipment.hasNoCommunication ? 'has-text-danger' : 'has-text-grey']" class="ml-2"><i class="fa-mr far fa-clock" /><time-ago :date="equipment.lastCommunication" :drop-fixes="true" /></span>
      </aside>
    </header>
    <custom-component v-if="isEquipmentHandled(equipment.module)" :component="getEquipmentComponent(equipment.module)" :equipment="equipment" class="card-content" />
    <generic-component v-else :equipment="equipment" class="card-content" />
  </article>
</template>

<script>
import TimeAgo from '@/components/TimeAgo'
import CustomComponent from '@/components/equipment/CustomComponent'
import GenericComponent from '@/components/equipment/GenericComponent'
import { createNamespacedHelpers } from 'vuex'
import { CmdMixin } from '@/mixins/Cmd'
const custom = window.custom
const { mapGetters } = createNamespacedHelpers('data')
const { mapState } = createNamespacedHelpers('app')

export default {
  components: {
    TimeAgo,
    CustomComponent,
    GenericComponent,
  },
  mixins: [CmdMixin],
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  computed: {
    equipment () { return this.getEquipmentById(this.id) },
    ...mapGetters(['getEquipmentById']),
    ...mapState(['roles']),
  },
  methods: {
    getEquipmentComponent (moduleName) {
      return custom.components[moduleName]
    },
    isEquipmentHandled (moduleName) {
      return (custom.components[moduleName] !== undefined)
    },
    hasRole (role) {
      return this.roles.includes(role)
    },
  },
}
</script>
