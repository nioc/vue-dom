<template>
  <o-sidebar v-model:open="open" variant="light" :fullheight="true" :overlay="true">
    <aside class="p-4">
      <div class="mb-5 is-flex-center">
        <img src="./../assets/home.png">
        <h1 class="subtitle ml-3">{{ title }}</h1>
      </div>
      <o-menu>
        <o-menu-list label="Navigation">
          <o-menu-item icon="home fa-fw fa-mr">
            <template #label="props">
              Pièces
              <i class="is-pulled-right fa" :class="props.expanded ? 'fa-caret-down' : 'fa-caret-up'" />
            </template>
            <o-menu-item :to="{name: 'rooms'}" label="Tous" tag="router-link" />
            <o-menu-item v-for="room in ordered" :key="room.id" :to="{name: 'room', params: {id: room.id}}" :label="room.name" :icon="'fa-fw fa-mr ' + (room.icon ? room.icon : 'fas fa-cube')" tag="router-link" />
          </o-menu-item>

          <o-menu-item v-if="dataStore.activeUserViews.length" icon="binoculars fa-fw fa-mr">
            <template #label="props">
              Vues
              <i class="is-pulled-right fa" :class="props.expanded ? 'fa-caret-down' : 'fa-caret-up'" />
            </template>
            <o-menu-item v-for="userView in dataStore.activeUserViews" :key="userView.code" :to="{name: 'view', params: {code: userView.code}}" :label="userView.title" :icon="'fa-fw fa-mr ' + userView.icon" tag="router-link" />
          </o-menu-item>

          <o-menu-item v-if="dataStore.tagsList.length" icon="tags fa-fw fa-mr">
            <template #label="props">
              Catégories
              <i class="is-pulled-right fa" :class="props.expanded ? 'fa-caret-down' : 'fa-caret-up'" />
            </template>
            <o-menu-item v-for="tag in dataStore.tagsList" :key="tag" :to="{name: 'tag', params: {tag}}" :label="tag" tag="router-link" />
          </o-menu-item>

          <o-menu-item icon="book fa-fw fa-mr" :to="{name: 'scenarios'}" tag="router-link">
            <template #label>
              Scénarios
            </template>
          </o-menu-item>

          <o-menu-item icon="info-circle fa-fw fa-mr" tag="router-link" :to="{name: 'about'}">
            <template #label>
              A propos
            </template>
          </o-menu-item>

          <o-menu-item icon="bug fa-fw fa-mr" tag="a" :href="bugUrl" target="_blank" rel="noreferrer">
            <template #label>
              Bug
            </template>
          </o-menu-item>

          <o-menu-item icon="bell fa-fw fa-mr" tag="router-link" :to="{name: 'notifications'}">
            <template #label>
              Notifications <notifications-counter class-name="is-inline ml-2" :is-link="false" />
            </template>
          </o-menu-item>

          <o-menu-item v-if="authStore.hasRole('user')" icon="user fa-fw fa-mr" tag="router-link" :to="{name: 'profile'}">
            <template #label>
              Profile
            </template>
          </o-menu-item>

          <o-menu-item v-if="authStore.hasRole('admin')" icon="tools fa-fw fa-mr">
            <template #label="props">
              Admin
              <i class="is-pulled-right fa" :class="props.expanded ? 'fa-caret-down' : 'fa-caret-up'" />
            </template>
            <o-menu-item :to="{name: 'admin-system'}" label="Système" tag="router-link" />
            <o-menu-item :to="{name: 'admin-users'}" label="Utilisateurs" tag="router-link" />
            <o-menu-item :to="{name: 'admin-rooms'}" label="Pièces" tag="router-link" />
            <o-menu-item :to="{name: 'admin-equipments'}" label="Équipement" tag="router-link" />
            <o-menu-item :to="{name: 'admin-states'}" label="États" tag="router-link" />
            <o-menu-item :to="{name: 'admin-actions'}" label="Actions" tag="router-link" />
            <o-menu-item :to="{name: 'admin-scenarios'}" label="Scénarios" tag="router-link" />
            <o-menu-item :to="{name: 'admin-nlp'}" label="Traitement automatique du langage naturel" tag="router-link" />
            <o-menu-item :to="{name: 'admin-channels'}" label="Canaux de communication" tag="router-link" />
          </o-menu-item>

        </o-menu-list>

        <o-menu-list label="Actions">
          <o-menu-item icon="sync-alt fa-fw fa-mr" tag="a" @click="refreshData">
            <template #label>
              Rafraichir les données
            </template>
          </o-menu-item>
          <o-menu-item icon="sign-out-alt fa-fw fa-mr" tag="a" @click="logout">
            <template #label>
              Logout
            </template>
          </o-menu-item>
          <o-menu-item :icon="isDarkMode ? 'toggle-on fa-fw fa-mr':'toggle-off fa-fw fa-mr'" tag="a" @click="setDarkMode">
            <template #label>
              Mode sombre
            </template>
          </o-menu-item>
          <o-menu-item :icon-pack="isHomepage ? 'fas' : 'far'" :icon="isHomepage ? 'ban fa-fw fa-mr':'bookmark fa-fw fa-mr'" tag="a" @click="setHomepage">
            <template #label>
              Page par défaut
            </template>
          </o-menu-item>
        </o-menu-list>

      </o-menu>
    </aside>
  </o-sidebar>
</template>

<script>
import { bugs } from '../../package.json'
import NotificationsCounter from '@/components/NotificationsCounter.vue'
import { useRoomsTree } from '@/composables/useRoomsTree.js'
import { useAppStore } from '@/store/app'
import { useDataStore } from '@/store/data'
import { useAuthStore } from '@/store/auth'
const custom = window.custom

export default {
  name: 'Sidebar',
  components: {
    NotificationsCounter,
  },
  setup() {
    const appStore = useAppStore()
    const dataStore = useDataStore()
    const authStore = useAuthStore()
    const { getRoomsOrdered } = useRoomsTree()
    return { appStore, dataStore, authStore, getRoomsOrdered }
  },
  data () {
    return {
      title: custom.title,
      bugUrl: bugs.url,
      isDarkMode: false,
      homepage: null,
    }
  },
  computed: {
    open: {
      get: function () {
        return this.appStore.hasSidebarOpened
      },
      set: function (value) {
        this.appStore.setSidebarStatus(value)
      },
    },
    ordered () {
      return this.getRoomsOrdered(this.dataStore.roomsRaw)
        .filter((room) => this.dataStore.getRoomVisiblesEquipment(room.id).length > 0)
    },
    isHomepage () {
      return this.homepage === this.$route.fullPath
    },
  },
  created () {
    if (localStorage.getItem('darkMode')) {
      this.isDarkMode = true
    }
    this.homepage = localStorage.getItem('homepage')
  },
  methods: {
    refreshData () {
      this.dataStore.vxLoadRooms()
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
    setHomepage () {
      if (this.isHomepage) {
        localStorage.removeItem('homepage')
        this.homepage = null
      } else {
        localStorage.setItem('homepage', this.$route.fullPath)
        this.homepage = this.$route.fullPath
      }
      this.open = false
    },
    async logout () {
      this.appStore.setEventsListener(false)
      await this.authStore.logout()
      this.$router.replace({ name: 'login' })
    },
  },
}
</script>
