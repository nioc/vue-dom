<template>
  <div v-if="count > 0" :class="className">
    <router-link v-if="isLink" :to="{name: 'notifications'}" title="Voir les notifications" class="tag is-danger is-normal is-rounded notification-counter">{{ count }}</router-link>
    <span v-else class="tag is-danger is-normal is-rounded notification-counter">{{ count }}</span>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapGetters } = createNamespacedHelpers('data')

export default {
  name: 'NotificationsCounter',
  props: {
    className: {
      type: String,
      default: '',
    },
    isLink: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters(['getNotificationsCount']),
    count () { return this.getNotificationsCount() },
  },
}
</script>
