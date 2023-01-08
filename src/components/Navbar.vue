<template>
  <nav class="navbar is-dark is-fixed-top">
    <div class="navbar-brand">
      <a class="navbar-item" href="#" @click="openSidebar">
        <div class="is-flex">
          <img src="./../assets/home.png" class="fa-mr">
          <notifications-counter class="is-hidden-tablet notification-counter-mobile fa-mr" :is-link="false" />
        </div>
        <span class="is-hidden-mobile">{{ title }}</span></a>
      <div class="navbar-item is-hidden-desktop sync-mobile"><sync /></div>
    </div>
    <div id="navbar-menu" class="navbar-menu">
      <div class="navbar-start">
        <router-link class="navbar-item" :to="{name: 'rooms'}" title="Pièces"><i class="fa fa-home fa-fw fa-mr" /><span class="is-navbar-label">Pièces</span></router-link>
        <div v-if="dataStore.activeUserViews.length" class="navbar-item has-dropdown" :class="{'is-active': hasDropdownViewsDisplayed}" @click="hasDropdownViewsDisplayed = !hasDropdownViewsDisplayed">
          <router-link v-slot="{href, isActive}" :to="{name: 'views'}" custom><a :href="href" class="navbar-link is-arrowless" :class="{'router-link-active': isActive}" @click.prevent=""><i class="fa fa-binoculars fa-fw fa-mr" /><span class="is-navbar-label">Vues</span></a></router-link>
          <div class="navbar-dropdown">
            <router-link v-for="userView in dataStore.activeUserViews" :key="userView.code" :to="{name: 'view', params: {code: userView.code}}" class="navbar-item"><span><i class="fa-fw fa-mr" :class="userView.icon" />{{ userView.title }}</span></router-link>
          </div>
        </div>
        <router-link class="navbar-item" :to="{name: 'scenarios'}" title="Scénarios"><i class="fa fa-book fa-fw fa-mr" /><span class="is-navbar-label">Scénarios</span></router-link>
        <div v-if="dataStore.tagsList.length" class="navbar-item has-dropdown" :class="{'is-active': hasDropdownTagsDisplayed}" @click="hasDropdownTagsDisplayed = !hasDropdownTagsDisplayed">
          <router-link v-slot="{href, isActive}" :to="{name: 'tags'}" custom><a :href="href" class="navbar-link is-arrowless" :class="{'router-link-active': isActive}" @click.prevent=""><i class="fa fa-tags fa-fw fa-mr" /><span class="is-navbar-label">Catégories</span></a></router-link>
          <div class="navbar-dropdown">
            <router-link v-for="tag in dataStore.tagsList" :key="tag" :to="{name: 'tag', params: {tag}}" class="navbar-item"><span>{{ tag }}</span></router-link>
          </div>
        </div>
        <router-link v-if="authStore.hasRole('admin')" class="navbar-item" :to="{name: 'admin'}" title="Admin"><i class="fa fa-tools fa-fw fa-mr" /><span class="is-navbar-label">Admin</span></router-link>
      </div>
      <div class="navbar-end is-flex-center">
        <notifications-counter class="is-hidden-mobile" class-name="navbar-item" :is-link="true" />
        <query />
        <div class="navbar-item sync-tablet"><sync /></div>
      </div>
    </div>
  </nav>
</template>

<script>
import Sync from '@/components/Sync.vue'
import Query from '@/components/Query.vue'
import NotificationsCounter from '@/components/NotificationsCounter.vue'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import { useDataStore } from '@/store/data'
const custom = window.custom

export default {
  name: 'Navbar',
  components: {
    Sync,
    Query,
    NotificationsCounter,
  },
  setup() {
    const appStore = useAppStore()
    const dataStore = useDataStore()
    const authStore = useAuthStore()
    return { appStore, dataStore, authStore }
  },
  data () {
    return {
      title: custom.title,
      hasDropdownTagsDisplayed: false,
      hasDropdownViewsDisplayed: false,
    }
  },
  watch: {
    $route (to) {
      if (to.name !== 'tag') {
        this.hasDropdownTagsDisplayed = false
      }
      if (to.name !== 'view') {
        this.hasDropdownViewsDisplayed = false
      }
    },
  },
  mounted () {
    document.body.classList.add('has-navbar-fixed-top')
  },
  methods: {
    openSidebar (e) {
      e.preventDefault()
      this.appStore.setSidebarStatus(true)
    },
  },
}
</script>
