<template>
  <section class="is-relative">
    <o-loading v-model:active="isLoading" :full-page="false" />
    <div v-if="intents.length" class="table-container">
      <table class="table is-striped is-fullwidth is-vertical-centered">
        <thead>
          <tr>
            <th>Clé</th>
            <th>Description</th>
            <th class="has-text-centered">Statut</th>
            <th class="has-text-centered">Énoncés</th>
            <th class="has-text-centered">Réponses</th>
            <th class="has-text-centered">Traitements</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="intent in intents" :key="intent.id">
            <td><router-link :to="{name: 'admin-intent', params: {id: intent.id}}">{{ intent.key }}</router-link></td>
            <td>{{ intent.description }}</td>
            <td class="has-text-centered"><i class="fas fa-fw" :class="intent.isActive ? 'fa-toggle-on has-text-success' : 'fa-toggle-off has-text-grey'" :title="intent.isActive ? 'Actif' : 'Inactif'" /></td>
            <td class="has-text-centered">{{ intent.utterances.length }}</td>
            <td class="has-text-centered">{{ intent.answers.length }}</td>
            <td class="has-text-centered">{{ intent.actions.length }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <span v-else-if="isLoaded">Il n'existe pas encore d'intention</span>

    <span class="buttons pt-3">
      <button class="button is-primary" @click="getIntents">
        <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
      </button>
      <button class="button is-primary" @click="createIntent">
        <span class="icon"><i class="fa fa-plus-circle" /></span><span>Créer</span>
      </button>
    </span>
  </section>
</template>

<script>
import { useAppStore } from '@/store/app'
import { useDataStore } from '@/store/data'
import { provider } from '@/services/Provider'

export default {
  name: 'Intents',
  setup() {
    const appStore = useAppStore()
    const dataStore = useDataStore()
    return { appStore, dataStore }
  },
  data () {
    return {
      intents: [],
      isLoading: false,
      isLoaded: false,
    }
  },
  mounted () {
    this.getIntents()
  },
  methods: {
    async getIntents () {
      this.isLoading = true
      try {
        this.intents = (await provider.getIntents()).sort((a, b) => a.key > b.key ? 1 : -1)
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
      this.isLoaded = true
    },
    createIntent () {
      this.$router.push({ name: 'admin-intent', params: { id: 'new' } })
    },
  },
}
</script>
