<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-views'}, icon: 'fa-binoculars', text: 'Vues utilisateur', isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <b-loading v-model="isLoading" :is-full-page="false" />
        <b-table :data="userViews" striped hoverable :mobile-cards="false" sort-icon="menu-up" default-sort="code" class="is-clickable" @click="consultUserView">
          <template v-for="column in columns">
            <b-table-column :key="column.id" v-bind="column">
              <template v-if="column.searchable" slot="searchable" slot-scope="props">
                <b-input v-model="props.filters[props.column.field]" placeholder="Rechercher..." icon="search" size="is-small" />
              </template>
              <template #default="props">
                <router-link v-if="column.field==='code'" :to="{name: 'admin-view', params: {id: props.row.id}}">{{ props.row.code }}</router-link>
                <i v-else-if="column.field==='isActive'" class="fas fa-fw" :class="props.row.isActive ? 'fa-toggle-on has-text-success' : 'fa-toggle-off has-text-grey'" :title="props.row.isActive ? 'Actif' : 'Inactif'" />
                <i v-else-if="column.field==='isShared'" class="fas fa-fw" :class="props.row.isShared ? 'fa-eye has-text-success' : 'fa-eye-slash has-text-grey'" :title="props.row.isShared ? 'Partagé' : 'Privé'" />
                <span v-else-if="column.field==='cardsCount'">{{ props.row.cards.length }}</span>
                <i v-else-if="column.field==='icon'" :title="props.row.icon" class="fa-fw" :class="props.row.icon" />
                <span v-else>{{ props.row[column.field] }}</span>
              </template>
            </b-table-column>
          </template>
        </b-table>

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
import Breadcrumb from '@/components/Breadcrumb'

export default {
  name: 'UserViews',
  components: {
    Breadcrumb,
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
        const userViews = await this.$Provider.getUserViews()
        this.userViews = userViews
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
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
