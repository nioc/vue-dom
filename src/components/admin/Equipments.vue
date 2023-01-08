<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-equipments'}, icon: 'fa-microchip', text: 'Equipements', isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <o-loading v-model:active="isLoading" :full-page="false" />
        <o-table :data="processed" :debounce-search="300" :paginated="true" striped hoverable :mobile-cards="false" sort-icon="caret-up" default-sort="roomName" class="is-clickable" @click="consultEquipment">
          <o-table-column v-for="column in columns" v-bind="column" :key="column.field">
            <template v-if="column.searchable" #searchable="props">
              <o-input v-model="props.filters[props.column.field]" placeholder="Rechercher..." icon="search" size="small" />
            </template>
            <template #default="props">
              <router-link v-if="column.field==='name'" :to="{name: 'admin-equipment', params: {id: props.row.id}}">{{ props.row.name }}</router-link>
              <i v-else-if="column.field==='isActive'" class="fas fa-fw" :class="props.row.isActive ? 'fa-toggle-on has-text-success' : 'fa-toggle-off has-text-grey'" :title="props.row.isActive ? 'Actif' : 'Inactif'" />
              <i v-else-if="column.field==='isVisible'" class="fas fa-fw" :class="props.row.isVisible ? 'fa-eye has-text-success' : 'fa-eye-slash has-text-grey'" :title="props.row.isVisible ? 'Visible' : 'Masqué'" />
              <time-ago v-else-if="column.field==='lastCommunication' && props.row.lastCommunication" :date="props.row.lastCommunication" :drop-fixes="true" title-format="PPPPpp" :class="{'has-text-danger': props.row.hasNoCommunication}" />
              <span v-else-if="column.field==='battery' && props.row.battery" :class="{'has-text-danger': props.row.battery < 10}">{{ props.row.battery }}%</span>
              <span v-else>{{ props.row[column.field] }}</span>
            </template>
          </o-table-column>
        </o-table>
        <span class="buttons pt-3">
          <button class="button is-primary" @click="getEquipments()">
            <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
          </button>
          <button class="button is-primary" @click="createEquipment()">
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
import { useDataStore } from '@/store/data'

export default {
  name: 'Equipments',
  components: {
    Breadcrumb,
    TimeAgo,
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
          searchable: true,
          sortable: true,
        },
        {
          field: 'module',
          label: 'Module',
          searchable: true,
          sortable: true,
        },
        {
          field: 'roomName',
          label: 'Emplacement',
          searchable: true,
          sortable: true,
        },
        {
          field: 'logicalId',
          label: 'Identifiant logique',
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
          field: 'battery',
          label: 'Batterie',
          sortable: true,
        },
        {
          field: 'lastCommunication',
          label: 'Dernière communication',
          sortable: true,
        },
        {
          field: 'alertNoCommunicationDelay',
          label: 'Délai d\'alerte',
          sortable: true,
        },
        {
          field: 'tagsText',
          label: 'Tags',
          sortable: true,
        },
      ],
    }
  },
  computed: {
    processed () {
      return this.dataStore.arrEquipments.map((equipment) => {
        const _equipment = Object.assign({}, equipment)
        _equipment.roomName = this.dataStore.getRoomById(_equipment.roomId).name || _equipment.roomId
        if (_equipment.tags) {
          _equipment.tagsText = _equipment.tags.join(' • ')
        }
        return _equipment
      })
    },
  },
  methods: {
    async getEquipments () {
      this.isLoading = true
      await this.dataStore.vxRefreshEquipments()
      this.isLoading = false
    },
    createEquipment () {
      this.$router.push({ name: 'admin-equipment', params: { id: 'new' } })
    },
    consultEquipment (equipment) {
      this.$router.push({ name: 'admin-equipment', params: { id: equipment.id } })
    },
  },
}
</script>
