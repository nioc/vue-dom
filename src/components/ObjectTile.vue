<template>
  <router-link :to="{name: 'object', params: {id: object.id}}" class="column" style="min-width: max-content">
    <div class="notification  has-padding-3 is-primary has-text-centered">
      <span class="subtitle">{{ object.name }}</span>
      <span class="is-size-7">
        <span v-for="info in summary.keys" :key="info.key" class="has-padding-left-8"><i class="fa fa-fw" :class="summaryIconClass(info.key)" />{{ info.value }}{{ summaryUnit(info.key) }}</span>
      </span>
    </div>
  </router-link>
</template>

<script>
import { SummaryMixin } from '@/mixins/Summary'
import { ObjectMixin } from '@/mixins/Object'

export default {
  name: 'Object',
  mixins: [SummaryMixin, ObjectMixin],
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  computed: {
    object () { return this.objectById(this.id) },
    summary () { return this.objectsSummaryById(this.id) },
  },
}
</script>
