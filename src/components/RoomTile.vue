<template>
  <router-link :to="{name: 'room', params: {id: room.id}}" class="column" style="min-width: max-content">
    <div class="notification  has-padding-3 is-primary has-text-centered">
      <span class="subtitle">{{ room.name }}</span>
      <span class="is-size-7">
        <span v-for="info in summary.keys" :key="info.key" class="has-padding-left-8"><i class="fa fa-fw" :class="getSummaryIconClass(info.key)" />{{ info.value }}{{ getSummaryUnit(info.key) }}</span>
      </span>
    </div>
  </router-link>
</template>

<script>
import { SummaryMixin } from '@/mixins/Summary'
import { RoomMixin } from '@/mixins/Room'

export default {
  name: 'Room',
  mixins: [SummaryMixin, RoomMixin],
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  computed: {
    room () { return this.getRoomById(this.id) },
    summary () { return this.getRoomSummaryById(this.id) },
  },
}
</script>
