<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'notifications'}, icon: 'fa-bell', text: 'Notifications', isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <div v-if="dataStore.notifications.length" class="table-container">
          <table class="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="notification in notifications" :key="notification.id" :class="{'has-text-danger': notification.level === 'error', 'has-text-warning-mid-dark': notification.level === 'warn'}">
                <td>{{ notification.date }}</td>
                <td>{{ notification.source }}</td>
                <td>{{ notification.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="notification">
          Pas de notifications
        </div>
        <span class="buttons">
          <button class="button is-primary" @click="dataStore.vxLoadNotifications">
            <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
          </button>
          <button v-if="dataStore.notifications.length" class="button is-danger" @click="dataStore.vxClearNotifications">
            <span class="icon"><i class="fa fa-trash-alt" /></span><span>Supprimer</span>
          </button>
        </span>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
import { useAppStore } from '@/store/app'
import { useDataStore } from '@/store/data'
import { dtFormat } from '@/services/Datetime'

export default {
  name: 'Notifications',
  components: {
    Breadcrumb,
  },
  setup() {
    const dataStore = useDataStore()
    const appStore = useAppStore()
    return { appStore, dataStore }
  },
  computed: {
    notifications () {
      return this.dataStore.notifications.map(notification => {
        return {
          ...notification,
          date: dtFormat(notification.date, 'PPPpp'),
        }
      })
    },
  },
  mounted () {
    this.dataStore.vxLoadNotifications()
  },
}
</script>
