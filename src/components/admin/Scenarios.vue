<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-scenarios'}, icon: 'fa-book', text: 'Scenarios', isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <o-loading v-model:active="isLoading" :full-page="false" />
        <o-table :data="scenarios" striped hoverable :mobile-cards="false" sort-icon="caret-up" default-sort="group" class="is-clickable" @click="consultScenario">
          <o-table-column v-for="column in columns" v-bind="column" :key="column.id">
            <template v-if="column.searchable" #searchable="props">
              <o-input v-model="props.filters[props.column.field]" placeholder="Rechercher..." icon="search" size="small" />
            </template>
            <template #default="props">
              <router-link v-if="column.field==='name'" :to="{name: 'admin-scenario', params: {id: props.row.id}}">{{ props.row.name }}</router-link>
              <i v-else-if="column.field==='isActive'" class="fas fa-fw" :class="props.row.isActive ? 'fa-toggle-on has-text-success' : 'fa-toggle-off has-text-grey'" :title="props.row.isActive ? 'Actif' : 'Inactif'" />
              <i v-else-if="column.field==='isVisible'" class="fas fa-fw" :class="props.row.isVisible ? 'fa-eye has-text-success' : 'fa-eye-slash has-text-grey'" :title="props.row.isVisible ? 'Visible' : 'Masqué'" />
              <i v-else-if="column.field==='isCronTriggered'" :class="{'fas fa-fw fa-bell': props.row.isCronTriggered}" />
              <i v-else-if="column.field==='isStateTriggered'" :class="{'fas fa-fw fa-eye': props.row.isStateTriggered}" />
              <time-ago v-else-if="column.field==='lastExecution' && props.row.lastExecution" :date="props.row.lastExecution" :drop-fixes="true" title-format="PPPPpp" />
              <span v-else>{{ props.row[column.field] }}</span>
            </template>
          </o-table-column>
        </o-table>

        <span class="buttons pt-3">
          <button class="button is-primary" @click="getScenario">
            <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
          </button>
          <button class="button is-primary" @click="createScenario">
            <span class="icon"><i class="fa fa-plus-circle" /></span><span>Créer</span>
          </button>
        </span>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
import TimeAgo from '@/components/TimeAgo.vue'
import { useAppStore } from '@/store/app'
import { provider } from '@/services/Provider'

export default {
  name: 'Scenarios',
  components: {
    Breadcrumb,
    TimeAgo,
  },
  setup() {
    const appStore = useAppStore()
    return { appStore }
  },
  data () {
    return {
      scenarios: [],
      columns: [
        {
          field: 'group',
          label: 'Groupe',
          searchable: true,
          sortable: true,
        },
        {
          field: 'name',
          label: 'Nom',
          searchable: true,
          sortable: true,
        },
        {
          field: 'isActive',
          label: 'Statut',
          sortable: true,
        },
        {
          field: 'isVisible',
          label: 'Visibilité',
          sortable: true,
        },
        {
          field: 'isCronTriggered',
          label: 'Programmé',
          sortable: true,
        },
        {
          field: 'isStateTriggered',
          label: 'Sur état',
          sortable: true,
        },
        {
          field: 'lastExecution',
          label: 'Dernière exécution',
          sortable: true,
        },
      ],
      isLoading: false,
    }
  },
  mounted () {
    this.getScenario()
  },
  methods: {
    async getScenario () {
      this.isLoading = true
      try {
        const scenarios = await provider.getScenarios()
        this.scenarios = scenarios.map((scenario) => {
          scenario.isCronTriggered = scenario.triggers.some((trigger) => trigger.type === 'datetime')
          scenario.isStateTriggered = scenario.triggers.some((trigger) => trigger.type === 'state')
          return scenario
        })
      } catch (error) {
        this.appStore.setInformation({ type: 'danger', message: error.message })
      }
      this.isLoading = false
    },
    createScenario () {
      this.$router.push({ name: 'admin-scenario', params: { id: 'new' } })
    },
    consultScenario (scenario) {
      this.$router.push({ name: 'admin-scenario', params: { id: scenario.id } })
    },
  },
}
</script>
