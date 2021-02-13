<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-channels'}, icon: 'fa-comments', text: 'Canaux', isActive: true}]" />
    </div>
    <div class="hero-body has-padding-horizontal-7">
      <div class="container">
        <b-loading v-model="isLoading" :is-full-page="false" />
        <b-table :data="processed" :paginated="true" striped hoverable :mobile-cards="false" sort-icon="menu-up" default-sort="name" class="is-clickable" @click="consultChannel">
          <template v-for="column in columns">
            <b-table-column :key="column.id" v-bind="column">
              <template #default="props">
                <router-link v-if="column.field==='name'" :to="{name: 'admin-channel', params: {id: props.row.id}}">{{ props.row.name }}</router-link>
                <i v-else-if="column.field==='hasPendingRequest'" class="fas fa-fw" :class="{'fa-user-clock': props.row.hasPendingRequest}" :title="props.row.hasPendingRequest ? 'En attente d\'une réponse de l\'utilisateur' : null" />
                <span v-else>{{ props.row[column.field] }}</span>
              </template>
            </b-table-column>
          </template>
        </b-table>
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
import Breadcrumb from '@/components/Breadcrumb'
import { AdminMixin } from '@/mixins/Admin'

export default {
  name: 'Channels',
  components: {
    Breadcrumb,
  },
  mixins: [
    AdminMixin,
  ],
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
      return this.arrChannels.map((channel) => {
        const _channel = Object.assign({}, channel)
        _channel.inputName = this.getStateById(channel.input).name || channel.input
        _channel.outputName = this.getActionById(channel.output).name || channel.output
        return _channel
      })
    },
  },
  methods: {
    async getChannels () {
      this.isLoading = true
      await this.vxRefreshChannels()
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
