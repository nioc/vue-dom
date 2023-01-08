<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-channels'}, icon: 'fa-comments', text: 'Canaux', isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <o-loading v-model:active="isLoading" :full-page="false" />
        <o-table :data="processed" :paginated="true" striped hoverable :mobile-cards="false" sort-icon="caret-up" default-sort="name" class="is-clickable" @click="consultChannel">
          <o-table-column v-for="column in columns" :key="column.id" v-bind="column">
            <template #default="props">
              <router-link v-if="column.field==='name'" :to="{name: 'admin-channel', params: {id: props.row.id}}">{{ props.row.name }}</router-link>
              <i v-else-if="column.field==='isActive'" class="fas fa-fw" :class="props.row.isActive ? 'fa-toggle-on has-text-success' : 'fa-toggle-off has-text-grey'" :title="props.row.isActive ? 'Actif' : 'Inactif'" />
              <i v-else-if="column.field==='hasPendingRequest'" class="fas fa-fw" :class="{'fa-user-clock': props.row.hasPendingRequest}" :title="props.row.hasPendingRequest ? 'En attente d\'une réponse de l\'utilisateur' : null" />
              <span v-else>{{ props.row[column.field] }}</span>
            </template>
          </o-table-column>
        </o-table>
        <span class="buttons pt-3">
          <button class="button is-primary" @click="getChannels">
            <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
          </button>
          <button class="button is-primary" @click="createChannel">
            <span class="icon"><i class="fa fa-plus-circle" /></span><span>Créer</span>
          </button>
        </span>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
import { useDataStore } from '@/store/data'

export default {
  name: 'Channels',
  components: {
    Breadcrumb,
  },
  setup() {
    const dataStore = useDataStore()
    return { dataStore }
  },
  data () {
    return {
      isLoading: false,
      columns: [
        {
          field: 'name',
          label: 'Nom',
          sortable: true,
        },
        {
          field: 'module',
          label: 'Module',
          sortable: true,
        },
        {
          field: 'logicalId',
          label: 'Identifiant logique',
          sortable: true,
        },
        {
          field: 'isActive',
          label: 'Statut',
          sortable: true,
        },
        {
          field: 'inputName',
          label: 'Receveur',
          sortable: true,
        },
        {
          field: 'outputName',
          label: 'Emetteur',
          sortable: true,
        },
        {
          field: 'hasPendingRequest',
          label: 'Réponse attendue',
          sortable: true,
        },
      ],
    }
  },
  computed: {
    processed () {
      return this.dataStore.arrChannels.map((channel) => {
        const _channel = Object.assign({}, channel)
        _channel.inputName = this.dataStore.getStateById(channel.input).name || channel.input
        _channel.outputName = this.dataStore.getActionById(channel.output).name || channel.output
        return _channel
      })
    },
  },
  mounted () {
    this.getChannels()
  },
  methods: {
    async getChannels () {
      this.isLoading = true
      await this.dataStore.vxRefreshChannels()
      this.isLoading = false
    },
    consultChannel (channel) {
      this.$router.push({ name: 'admin-channel', params: { id: channel.id } })
    },
    createChannel () {
      this.$router.push({ name: 'admin-channel', params: { id: 'new' } })
    },
  },
}
</script>
