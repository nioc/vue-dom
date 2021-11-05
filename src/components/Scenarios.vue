<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'scenarios'}, icon: 'fa-book', text: 'Scénarios', isActive: true}]" />
    </div>
    <div class="hero-body">
      <div class="container">
        <ul>
          <li v-for="scenario in scenarios" :key="scenario.id" class="card mb-4">
            <header class="card-header">
              <p class="card-header-title"><span v-if="scenario.group" class="mr-2 has-text-grey-light">[{{ scenario.group }}]</span>{{ scenario.name }}<router-link v-if="hasRole('admin')" :to="{name: 'admin-scenario', params: {id: scenario.id}}" title="Gérer le scénario"><i class="fas ml-2 fa-sm fa-tools has-text-grey-light" /></router-link></p>
            </header>
            <div class="card-content">
              <p v-if="scenario.description" class="content">{{ scenario.description }}</p>
              <button v-if="(scenario.state === 'stop' || scenario.state === '')" class="button is-primary" @click="run(scenario.id)">
                <span class="icon"><i class="fa fa-play-circle" /></span><span>Exécuter</span>
              </button>
              <button v-else-if="scenario.state === 'in progress'" class="button is-primary">
                <span class="icon"><i class="fa fa-stop-circle" /></span><span>Arrêter</span>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import { createNamespacedHelpers } from 'vuex'
const { mapGetters, mapActions } = createNamespacedHelpers('data')
const { mapState } = createNamespacedHelpers('app')

export default {
  name: 'Scenarios',
  components: {
    Breadcrumb,
  },
  computed: {
    ...mapGetters(['getScenarios']),
    ...mapState(['roles']),
    scenarios () { return this.getScenarios().filter((scenario) => scenario.isVisible && scenario.isActive) },
  },
  created () {
    this.vxLoadScenarios()
  },
  methods: {
    run (id) {
      this.$Provider.changeScenarioState(id, 'run')
    },
    hasRole (role) {
      return this.roles.includes(role)
    },
    ...mapActions(['vxLoadScenarios']),
  },
}
</script>
