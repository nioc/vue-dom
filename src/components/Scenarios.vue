<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: '/scenarios', icon: 'fa-book', text: 'Scénarios', isActive: true}]" />
    </div>
    <div class="hero-body">
      <div class="container">
        <ul>
          <li v-for="scenario in scenarios" :key="scenario.id" class="card has-margin-bottom-6">
            <header class="card-header">
              <p class="card-header-title"><span v-if="scenario.group" class="has-margin-right-8 has-text-grey-light">[{{ scenario.group }}]</span>{{ scenario.display.name }}</p>
            </header>
            <div class="card-content">
              <button v-if="scenario.state === 'stop'" class="button is-primary" @click="run(scenario.id)">
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

export default {
  name: 'Scenarios',
  components: {
    Breadcrumb,
  },
  data () {
    return {
      scenarios: [],
    }
  },
  async mounted () {
    try {
      this.scenarios = await this.$JeedomApi.getScenarios()
    } catch (error) {
      const message = `Erreur lors de la requête de récupération des scénarios<br>${error.message}`
      this.$store.commit('setInformation', { type: 'is-danger', message })
    }
  },
  methods: {
    run (id) {
      this.$JeedomApi.changeScenarioState(id, 'run')
    },
  },
}
</script>
