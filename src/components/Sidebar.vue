<template>
  <b-sidebar type="is-light" :fullheight="true" :open.sync="open" :overlay="true">
    <aside class="has-padding-6">
      <div class="has-margin-bottom-5 is-flex-center">
        <img src="./../assets/home.png">
        <h1 class="subtitle has-margin-left-7">{{ title }}</h1>
      </div>
      <b-menu>
        <b-menu-list label="Navigation">
          <b-menu-item icon="home fa-fw fa-mr">
            <template slot="label" slot-scope="props">
              Objets
              <i class="is-pulled-right fa" :class="props.expanded ? 'fa-caret-down' : 'fa-caret-up'" />
            </template>
            <b-menu-item :to="{name: 'objects'}" label="Tous" tag="router-link" />
            <b-menu-item v-for="object in objectsOrdered" :key="object.id" :to="{name: 'object', params: {id: object.id}}" :label="object.name" tag="router-link" />
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
        </b-menu-list>

      </b-menu>
    </aside>
  </b-sidebar>
</template>

<script>
import { bugs } from '../../package.json'
import Auth from '@/services/Auth'
import { ObjectsMixin } from '@/mixins/Objects'
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapMutations } = createNamespacedHelpers('app')
const custom = window.custom

export default {
  name: 'Sidebar',
  mixins: [ObjectsMixin],
  data () {
    return {
      title: custom.title,
      bugUrl: bugs.url,
    }
  },
  computed: {
    open: {
      get: function () { return this.hasSidebarOpened },
      set: function (value) {
        this.setSidebarStatus(value)
      },
    },
    ordered () { return this.objectsOrdered.filter((object) => object.eqLogics.length > 0 && object.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1) },
    ...mapState(['hasSidebarOpened']),
  },
  methods: {
    refreshData () {
      this.loadObjects()
      this.open = false
    },
    logout () {
      this.$JeedomApi.closeEventsListener()
      Auth.logout()
      this.$router.replace({ name: 'login' })
    },
    ...mapMutations(['setSidebarStatus']),
  },
}
</script>
