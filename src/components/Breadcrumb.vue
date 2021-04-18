<template>
  <div class="box is-radiusless has-background-white-bis">
    <nav class="breadcrumb container is-flex-space-between" aria-label="breadcrumbs">
      <ul>
        <li v-for="(item, index) in items" :key="item.text" :class="{'is-active': item.isActive}">
          <router-link :to="item.link">
            <span v-if="item.icon" class="icon is-small">
              <i class="fa" :class="item.icon" aria-hidden="true" />
            </span>
            <span :class="{'is-hidden-mobile': index !== (items.length-1) && item.icon}">{{ item.text }}</span>
          </router-link>
        </li>
      </ul>
      <aside v-if="summary && summary.keys" class="has-text-grey has-text-weight-light is-size-7 ml-3">
        <span v-for="info in summary.keys" :key="info.key" class="pl-2"><i class="fa-fw" :class="getSummaryIconClass(info.key)" />{{ info.value }}{{ getSummaryUnit(info.key) }}</span>
      </aside>
    </nav>
  </div>
</template>

<script>
import { SummaryMixin } from '@/mixins/Summary'
export default {
  mixins: [SummaryMixin],
  props: {
    items: {
      type: Array,
      required: true,
    },
    summary: {
      type: Object,
      required: false,
      default: null,
    },
  },
}
</script>
