<template>
  <b-sidebar v-model="open" type="is-light" :fullheight="true" :overlay="true">
    <aside class="has-padding-6">
      <div class="has-margin-bottom-5 is-flex-center">
        <img src="./../assets/home.png">
        <h1 class="subtitle has-margin-left-7">{{ title }}</h1>
      </div>
      <b-menu>
        <b-menu-list label="Navigation">
          <b-menu-item icon="home fa-fw fa-mr">
            <template slot="label" slot-scope="props">
              Pièces
              <i class="is-pulled-right fa" :class="props.expanded ? 'fa-caret-down' : 'fa-caret-up'" />
            </template>
            <b-menu-item :to="{name: 'rooms'}" label="Tous" tag="router-link" />
            <b-menu-item v-for="room in roomsOrdered" :key="room.id" :to="{name: 'room', params: {id: room.id}}" :label="room.name" tag="router-link" />
          </b-menu-item>

          <b-menu-item v-if="tagsList.length" icon="tags fa-fw fa-mr">
            <template slot="label" slot-scope="props">
              Catégories
              <i class="is-pulled-right fa" :class="props.expanded ? 'fa-caret-down' : 'fa-caret-up'" />
            </template>
            <b-menu-item v-for="tag in tagsList" :key="tag" :to="{name: 'tag', params: {tag}}" :label="tag" tag="router-link" />
          </b-menu-item>

          <b-menu-item icon="book fa-fw fa-mr" :to="{name: 'scenarios'}" tag="router-link">
            <template slot="label">
              Scénarios
            </template>
          </b-menu-item>

          <b-menu-item icon="info-circle fa-fw fa-mr" tag="router-link" :to="{name: 'about'}">
            <template slot="label">
              A propos
            </template>
          </b-menu-item>

          <b-menu-item icon="bug fa-fw fa-mr" tag="a" :href="bugUrl" target="_blank" rel="noreferrer">
            <template slot="label">
              Bug
            </template>
          </b-menu-item>

          <b-menu-item icon="bell fa-fw fa-mr" tag="router-link" :to="{name: 'notifications'}">
            <template slot="label">
              Notifications <notifications-counter class-name="is-inline has-margin-left-8" :is-link="false" />
            </template>
          </b-menu-item>

        </b-menu-list>

        <b-menu-list label="Actions">
          <b-menu-item icon="sync-alt fa-fw fa-mr" tag="a" @click="refreshData">
            <template slot="label">
              Rafraichir les données
            </template>
          </b-menu-item>
          <b-menu-item icon="sign-out-alt fa-fw fa-mr" tag="a" @click="logout">
            <template slot="label">
              Logout
            </template>
          </b-menu-item>
          <b-menu-item :icon="isDarkMode ? 'toggle-on fa-fw fa-mr':'toggle-off fa-fw fa-mr'" tag="a" @click="setDarkMode">
            <template slot="label">
              Mode sombre
            </template>
          </b-menu-item>
        </b-menu-list>

      </b-menu>
    </aside>
  </b-sidebar>
</template>

<script>
import { bugs } from '../../package.json'
import Auth from '@/services/Auth'
import { RoomsMixin } from '@/mixins/Rooms'
import NotificationsCounter from '@/components/NotificationsCounter'
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapMutations } = createNamespacedHelpers('app')
const custom = window.custom

export default {
  name: 'Sidebar',
  components: {
    NotificationsCounter,
  },
  mixins: [RoomsMixin],
  data () {
    return {
      title: custom.title,
      bugUrl: bugs.url,
      isDarkMode: false,
    }
  },
  computed: {
    open: {
      get: function () { return this.hasSidebarOpened },
      set: function (value) {
        this.setSidebarStatus(value)
      },
    },
    ordered () { return this.roomsOrdered.filter((room) => room.equipment.length > 0 && room.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1) },
    ...mapState(['hasSidebarOpened']),
  },
  created () {
    if (localStorage.getItem('darkMode')) {
      this.isDarkMode = true
    }
  },
  methods: {
    refreshData () {
      this.loadRooms()
      this.open = false
    },
    setDarkMode () {
      this.isDarkMode = !this.isDarkMode
      if (this.isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark')
        localStorage.setItem('darkMode', '1')
      } else {
        document.documentElement.removeAttribute('data-theme')
        localStorage.removeItem('darkMode')
      }
      this.open = false
    },
    logout () {
      this.$Provider.closeEventsListener()
      Auth.logout()
      this.$router.replace({ name: 'login' })
    },
    ...mapMutations(['setSidebarStatus']),
  },
}
</script>
