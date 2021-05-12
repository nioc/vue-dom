<template>
  <b-sidebar v-model="open" type="is-light" :fullheight="true" :overlay="true">
    <aside class="p-4">
      <div class="mb-5 is-flex-center">
        <img src="./../assets/home.png">
        <h1 class="subtitle ml-3">{{ title }}</h1>
      </div>
      <b-menu>
        <b-menu-list label="Navigation">
          <b-menu-item icon="home fa-fw fa-mr">
            <template slot="label" slot-scope="props">
              Pièces
              <i class="is-pulled-right fa" :class="props.expanded ? 'fa-caret-down' : 'fa-caret-up'" />
            </template>
            <b-menu-item :to="{name: 'rooms'}" label="Tous" tag="router-link" />
            <b-menu-item v-for="room in ordered" :key="room.id" :to="{name: 'room', params: {id: room.id}}" :label="room.name" tag="router-link" />
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
              Notifications <notifications-counter class-name="is-inline ml-2" :is-link="false" />
            </template>
          </b-menu-item>

          <b-menu-item v-if="hasRole('user')" icon="user fa-fw fa-mr" tag="router-link" :to="{name: 'profile'}">
            <template slot="label">
              Profile
            </template>
          </b-menu-item>

          <b-menu-item v-if="hasRole('admin')" icon="tools fa-fw fa-mr">
            <template slot="label" slot-scope="props">
              Admin
              <i class="is-pulled-right fa" :class="props.expanded ? 'fa-caret-down' : 'fa-caret-up'" />
            </template>
            <b-menu-item :to="{name: 'admin-system'}" label="Système" tag="router-link" />
            <b-menu-item :to="{name: 'admin-users'}" label="Utilisateurs" tag="router-link" />
            <b-menu-item :to="{name: 'admin-rooms'}" label="Pièces" tag="router-link" />
            <b-menu-item :to="{name: 'admin-equipments'}" label="Équipement" tag="router-link" />
            <b-menu-item :to="{name: 'admin-states'}" label="États" tag="router-link" />
            <b-menu-item :to="{name: 'admin-actions'}" label="Actions" tag="router-link" />
            <b-menu-item :to="{name: 'admin-scenarios'}" label="Scénarios" tag="router-link" />
            <b-menu-item :to="{name: 'admin-nlp'}" label="Traitement automatique du langage naturel" tag="router-link" />
            <b-menu-item :to="{name: 'admin-channels'}" label="Canaux de communication" tag="router-link" />
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
    ordered () { return this.roomsOrdered.filter((room) => this.getRoomVisiblesEquipment(room.id).length > 0) },
    ...mapState(['hasSidebarOpened', 'roles']),
  },
  created () {
    if (localStorage.getItem('darkMode')) {
      this.isDarkMode = true
    }
  },
  methods: {
    hasRole (role) {
      return this.roles.includes(role)
    },
    refreshData () {
      this.vxLoadRooms()
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
    async logout () {
      this.$Provider.closeEventsListener()
      await Auth.logout()
      this.$router.replace({ name: 'login' })
    },
    ...mapMutations(['setSidebarStatus']),
  },
}
</script>
