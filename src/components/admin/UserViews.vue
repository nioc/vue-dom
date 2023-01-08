<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-views'}, icon: 'fa-binoculars', text: 'Vues utilisateur', isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <o-loading v-model:active="isLoading" :full-page="false" />
        <o-table :data="userViews" striped hoverable :mobile-cards="false" sort-icon="caret-up" default-sort="code" class="is-clickable" @click="consultUserView">
          <o-table-column v-for="column in columns" :key="column.id" v-bind="column">
            <template v-if="column.searchable" #searchable="props">
              <o-input v-model="props.filters[props.column.field]" placeholder="Rechercher..." icon="search" size="small" />
            </template>
            <template #default="props">
              <router-link v-if="column.field==='code'" :to="{name: 'admin-view', params: {id: props.row.id}}">{{ props.row.code }}</router-link>
              <i v-else-if="column.field==='isActive'" class="fas fa-fw" :class="props.row.isActive ? 'fa-toggle-on has-text-success' : 'fa-toggle-off has-text-grey'" :title="props.row.isActive ? 'Actif' : 'Inactif'" />
              <i v-else-if="column.field==='isShared'" class="fas fa-fw" :class="props.row.isShared ? 'fa-eye has-text-success' : 'fa-eye-slash has-text-grey'" :title="props.row.isShared ? 'Partagé' : 'Privé'" />
              <span v-else-if="column.field==='cardsCount'">{{ props.row.cards.length }}</span>
              <i v-else-if="column.field==='icon'" :title="props.row.icon" class="fa-fw" :class="props.row.icon" />
              <span v-else>{{ props.row[column.field] }}</span>
            </template>
          </o-table-column>
        </o-table>

        <span class="buttons pt-3">
          <button class="button is-primary" @click="getUserView">
            <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
          </button>
          <button class="button is-primary" @click="createUserView">
            <span class="icon"><i class="fa fa-plus-circle" /></span><span>Créer</span>
          </button>
        </span>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
import { useAppStore } from '@/store/app'
import { provider } from '@/services/Provider'

export default {
  name: 'UserViews',
  components: {
    Breadcrumb,
  },
  setup() {
    const appStore = useAppStore()
    return { appStore }
  },
  data () {
    return {
      userViews: [],
      columns: [
        {
          field: 'code',
          label: 'Nom',
          searchable: true,
          sortable: true,
        },
        {
          field: 'title',
          label: 'Titre',
          searchable: true,
          sortable: true,
        },
        {
          field: 'isActive',
          label: 'Statut',
          sortable: true,
        },
        {
          field: 'isShared',
          label: 'Partagé',
          sortable: true,
        },
        {
          field: 'cardsCount',
          label: 'Cartes',
        },
        {
          field: 'icon',
          label: 'Icône',
        },
      ],
      isLoading: false,
    }
  },
  mounted () {
    this.getUserView()
  },
  methods: {
    async getUserView () {
      this.isLoading = true
      try {
        this.userViews = await provider.getUserViews()
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    createUserView () {
      this.$router.push({ name: 'admin-view', params: { id: 'new' } })
    },
    consultUserView (userView) {
      this.$router.push({ name: 'admin-view', params: { id: userView.id } })
    },
  },
}
</script>
