<template>
  <section>
    <b-loading v-model="isLoading" :is-full-page="false" />
    <div v-if="entities.length" class="table-container">
      <table class="table is-striped is-fullwidth is-vertical-centered">
        <thead>
          <tr>
            <th>Clé</th>
            <th>Description</th>
            <th class="has-text-centered">Statut</th>
            <th class="has-text-centered">Options</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entity in entities" :key="entity.id">
            <td><router-link v-if="entity.id" :to="{name: 'admin-entity', params: {id: entity.id}}">{{ entity.key }}</router-link></td>
            <td>{{ entity.description }}</td>
            <td class="has-text-centered"><i class="fas fa-fw" :class="entity.isActive ? 'fa-toggle-on has-text-success' : 'fa-toggle-off has-text-grey'" :title="entity.isActive ? 'Actif' : 'Inactif'" /></td>
            <td class="has-text-centered">{{ entity.options.length }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <span v-else-if="isLoaded">Il n'existe pas encore d'entité</span>

    <span class="buttons pt-3">
      <button class="button is-primary" @click="getEntities">
        <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
      </button>
      <button class="button is-primary" @click="createEntity">
        <span class="icon"><i class="fa fa-plus-circle" /></span><span>Créer</span>
      </button>
    </span>
  </section>
</template>

<script>
export default {
  name: 'Entities',
  data () {
    return {
      entities: [],
      isLoading: false,
      isLoaded: false,
    }
  },
  mounted () {
    this.getEntities()
  },
  methods: {
    async getEntities () {
      this.isLoading = true
      try {
        this.entities = (await this.$Provider.getEntities()).sort((a, b) => a.key > b.key ? 1 : -1)
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      this.isLoading = false
      this.isLoaded = true
    },
    createEntity () {
      this.$router.push({ name: 'admin-entity', params: { id: 'new' } })
    },
  },
}
</script>
