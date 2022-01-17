<template>
  <div v-if="count > 0" :class="className">
    <b-tooltip v-if="isLink" position="is-bottom" type="is-dark">
      <router-link :to="{name: 'notifications'}" title="Voir les notifications" class="tag is-danger is-normal is-rounded notification-counter">{{ count }}</router-link>
      <template #content>
        <div v-for="(notification, index) in notifications" :key="index">
          <span :class="{'has-text-danger': notification.level === 'error', 'has-text-warning-mid-dark': notification.level === 'warn'}">{{ notification.message }}</span>
        </div>
      </template>
    </b-tooltip>
    <span v-else class="tag is-danger is-normal is-rounded notification-counter">{{ count }}</span>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapGetters } = createNamespacedHelpers('data')

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
    ...mapState(['notifications']),
    count () { return this.getNotificationsCount() },
  },
}
</script>
