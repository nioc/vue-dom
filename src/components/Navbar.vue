<template>
  <nav class="navbar is-dark is-fixed-top">
    <div class="navbar-brand">
      <span class="navbar-item"><img src="./../assets/home.png" class="fa-mr"><span class="is-hidden-mobile">{{ title }}</span></span>
      <div class="navbar-item is-hidden-desktop sync-mobile"><sync /></div>
      <a id="navbar-burger" role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" @click="toggleMenu">
        <span aria-hidden="true" class="is-primary" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </a>
    </div>
    <div id="navbar-menu" class="navbar-menu">
      <div class="navbar-start">
        <router-link class="navbar-item" :to="{name: 'objects'}" title="Objets"><i class="fa fa-home fa-fw fa-mr" /><span class="is-navbar-label">Objets</span></router-link>
        <router-link class="navbar-item" :to="{name: 'scenarios'}" title="Scénarios"><i class="fa fa-book fa-fw fa-mr" /><span class="is-navbar-label">Scénarios</span></router-link>
        <div v-if="tagsList.length" class="navbar-item has-dropdown" :class="{'is-active': hasDropdownTagsDisplayed}" @click="hasDropdownTagsDisplayed = !hasDropdownTagsDisplayed">
          <router-link class="navbar-link is-arrowless" :to="{name: 'tags'}" event=""><i class="fa fa-tags fa-fw fa-mr" /><span class="is-navbar-label">Catégories</span></router-link>
          <div class="navbar-dropdown">
            <router-link v-for="tag in tagsList" :key="tag" :to="{name: 'tag', params: {tag}}" class="navbar-item">{{ tag }}</router-link>
          </div>
        </div>
      </div>
      <div class="navbar-end">
        <div class="navbar-item sync-tablet"><sync /></div>
        <div class="navbar-item has-dropdown" :class="{'is-active': hasDropdownUserDisplayed}" @click="hasDropdownUserDisplayed = !hasDropdownUserDisplayed">
          <a class="navbar-link is-arrowless"><i class="fa fa-user fa-fw fa-mr" /><span class="is-navbar-label">{{ login }}</span></a>
          <div class="navbar-dropdown is-right">
            <a class="navbar-item" @click="refreshData"><i class="fa fa-sync-alt fa-fw fa-mr" />Rafraichir les données</a>
            <router-link class="navbar-item" :to="{name: 'about'}"><i class="fa fa-info-circle fa-fw fa-mr" />A propos</router-link>
            <a class="navbar-item" :href="bugUrl" target="_blank" rel="noreferrer"><i class="fa fa-bug fa-fw fa-mr" />Bug</a>
            <hr class="navbar-divider">
            <a class="navbar-item" @click="logout()"><i class="fa fa-sign-out-alt fa-fw fa-mr" />Logout</a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { bugs } from '../../package.json'
import Auth from '@/services/Auth'
import Sync from '@/components/Sync'
import { ObjectsMixin } from '@/mixins/Objects'
import { createNamespacedHelpers } from 'vuex'
const { mapState } = createNamespacedHelpers('app')
const custom = window.custom

export default {
  name: 'Navbar',
  components: {
    Sync,
  },
  mixins: [ObjectsMixin],
  data () {
    return {
      title: custom.title,
      bugUrl: bugs.url,
      hasDropdownUserDisplayed: false,
      hasDropdownTagsDisplayed: false,
    }
  },
  computed: {
    ...mapState(['login']),
  },
  mounted () {
    document.body.classList.add('has-navbar-fixed-top')
  },
  methods: {
    logout () {
      this.$JeedomApi.closeEventsListener()
      Auth.logout()
      this.$router.replace({ name: 'login' })
    },
    refreshData () {
      this.loadObjects()
      this.toggleMenu({ target: document.getElementById('navbar-burger') })
    },
    toggleMenu (e) {
      e.target.classList.toggle('is-active')
      document.getElementById('navbar-menu').classList.toggle('is-active')
    },
  },
}
</script>
