<template>
  <ul>
    <li v-for="room in rooms" :key="room.id" class="has-medium-tag">
      <router-link :to="{name: 'room', params: {id: room.id}}" class="tag is-medium is-primary py-5 px-4" :title="`Consulter la pièce &quot;${room.name}&quot;`">
        <i class="fa-fw fa-mr" :class="(room.icon ? room.icon : 'fas fa-cube')" />
        <span class="has-text-weight-medium">{{ room.name }}</span>
        <span class="is-size-7">
          <span v-for="info in dataStore.getRoomSummaryById(room.id).keys" :key="info.key" class="pl-2"><i class="fa fa-fw" :class="getSummaryIconClass(info.key)" />{{ info.value }}{{ getSummaryUnit(info.key) }}</span>
        </span>

      </router-link>
      <rooms-tree :rooms="room.childs" />
    </li>
  </ul>
</template>

<script>
import { useDataStore } from '@/store/data'
import { useSummary } from '@/composables/useSummary'

export default {
  name: 'RoomsTree',
  props: {
    rooms: {
      type: Array,
      required: true,
    },
  },
  setup() {
    const dataStore = useDataStore()
    const { getSummaryIconClass, getSummaryUnit } = useSummary()
    return { dataStore, getSummaryIconClass, getSummaryUnit }
  },

}
</script>
