<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'notifications'}, icon: 'fa-bell', text: 'Notifications', isActive: true}]" />
    </div>
    <div class="hero-body has-padding-horizontal-7">
      <div class="container">
        <table v-if="notifications.length" class="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Date</th>
              <th>Source</th>
              <th>Message</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notification in notifications" :key="notification.id">
              <td>{{ notification.date | moment('LL LTS') }}</td>
              <td>{{ notification.plugin }}</td>
              <td>{{ notification.message }}</td>
              <td>{{ notification.action }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="notification">
          Pas de notifications
        </div>
        <span class="buttons">
          <button class="button is-primary" @click="vxLoadNotifications">
            <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
          </button>
          <button v-if="notifications.length" class="button is-danger" @click="clear">
            <span class="icon"><i class="fa fa-trash-alt" /></span><span>Supprimer</span>
          </button>
        </span>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapActions } = createNamespacedHelpers('data')

export default {
  name: 'Notifications',
  components: {
    Breadcrumb,
  },
  computed: {
    ...mapState(['notifications']),
  },
  mounted () {
    this.vxLoadNotifications()
  },
  methods: {
    ...mapActions(['vxLoadNotifications']),
    async clear () {
      try {
        await this.$Provider.clearNotifications()
        this.vxLoadNotifications()
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
    },
  },
}
</script>
