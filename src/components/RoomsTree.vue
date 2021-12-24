<template>
  <ul>
    <li v-for="room in rooms" :key="room.id" class="has-medium-tag">
      <router-link :to="{name: 'room', params: {id: room.id}}" class="tag is-medium is-primary p-5" :title="`Consulter la pièce &quot;${room.name}&quot;`">
        <span class="has-text-weight-medium">{{ room.name }}</span>
        <span v-if="room.summary && room.summary.length > 0" class="is-size-7">
          <span v-for="info in getRoomSummaryById(room.id).keys" :key="info.key" class="pl-2"><i class="fa fa-fw" :class="getSummaryIconClass(info.key)" />{{ info.value }}{{ getSummaryUnit(info.key) }}</span>
        </span>

      </router-link>
      <rooms-tree :rooms="room.childs" />
    </li>
  </ul>
</template>

<script>
import { SummaryMixin } from '@/mixins/Summary'

export default {
  name: 'RoomsTree',
  mixins: [
    SummaryMixin,
  ],
  props: {
    rooms: {
      type: Array,
      required: true,
    },
  },

}
</script>
