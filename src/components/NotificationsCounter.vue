<template>
  <div v-if="count > 0" :class="className">
    <o-tooltip v-if="isLink" position="bottom" variant="dark">
      <router-link :to="{name: 'notifications'}" title="Voir les notifications" class="tag is-danger is-normal is-rounded notification-counter">{{ count }}</router-link>
      <template #content>
        <div v-for="(notification, index) in dataStore.notifications" :key="index">
          <span :class="{'has-text-danger': notification.level === 'error', 'has-text-warning-mid-dark': notification.level === 'warn'}">{{ notification.message }}</span>
        </div>
      </template>
    </o-tooltip>
    <span v-else class="tag is-danger is-normal is-rounded notification-counter">{{ count }}</span>
  </div>
</template>

<script>
import { useDataStore } from '@/store/data'

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
  setup() {
    const dataStore = useDataStore()
    return { dataStore }
  },
  computed: {
    count () {
      return this.dataStore.getNotificationsCount
    },
  },
}
</script>
