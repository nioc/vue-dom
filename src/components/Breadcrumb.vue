<template>
  <div class="box is-radiusless has-background-white-bis">
    <nav class="breadcrumb container" aria-label="breadcrumbs">
      <ul>
        <li v-for="(item, index) in items" :key="item.text" :class="{'is-active': item.isActive}">
          <router-link :to="item.link">
            <span v-if="item.icon" class="icon is-small">
              <i class="fa" :class="item.icon" aria-hidden="true" />
            </span>
            <span :class="{'is-hidden-mobile': index !== (items.length-1) && item.icon}">{{ item.text }}</span>
          </router-link>
        </li>
        <li v-if="html">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span class="has-text-grey has-text-weight-light is-size-7 has-margin-left-7" v-html="html" />
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
    html: {
      type: String,
      required: false,
      default: null,
    },
  },
}
</script>
