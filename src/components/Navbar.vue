<template>
  <nav class="navbar is-dark is-fixed-top">
    <div class="navbar-brand">
      <router-link class="navbar-item" to="/"><img src="./../assets/home.png" class="fa-mr">{{ title }}</router-link>
      <div class="navbar-item is-hidden-desktop sync-mobile"><sync /></div>
      <a id="navbar-burger" role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" @click="toggleMenu">
        <span aria-hidden="true" class="is-primary" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </a>
    </div>
    <div id="navbar-menu" class="navbar-menu">
      <div class="navbar-start">
        <router-link class="navbar-item" to="/objects"><i class="fa fa-home fa-fw fa-mr" />Objets</router-link>
        <router-link class="navbar-item" to="/scenarios"><i class="fa fa-book fa-fw fa-mr" />Scénarios</router-link>
      </div>
      <div class="navbar-end">
        <div class="navbar-item is-flex-tablet"><sync /></div>
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link"><i class="fa fa-user fa-fw fa-mr" />{{ login }}</a>
          <div class="navbar-dropdown is-right">
            <router-link class="navbar-item" to="/about"><i class="fa fa-info-circle fa-fw fa-mr" />A propos</router-link>
            <a class="navbar-item" :href="bugUrl" target="_blank" rel="noreferrer"><i class="fa fa-bug fa-fw fa-mr" />Bug</a>
            <hr class="navbar-divider">
            <a class="navbar-item" @click="logout()"><i class="fa fa-sign-out fa-fw fa-mr" />Logout</a>
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
import { mapState } from 'vuex'
const custom = window.custom

export default {
  name: 'Navbar',
  components: {
    Sync,
  },
  data () {
    return {
      title: custom.title,
      bugUrl: bugs.url,
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
    toggleMenu (e) {
      e.target.classList.toggle('is-active')
      document.getElementById('navbar-menu').classList.toggle('is-active')
    },
  },
}
</script>
