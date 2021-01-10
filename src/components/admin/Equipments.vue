<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-equipments'}, icon: 'fa-microchip', text: 'Equipements', isActive: true}]" />
    </div>
    <div class="hero-body has-padding-horizontal-7">
      <div class="container">
        <b-loading v-model="isLoading" :is-full-page="false" />
        <b-table :data="processed" striped hoverable :mobile-cards="false" sort-icon="menu-up" default-sort="roomName" class="is-clickable content" @click="consultEquipment">
          <template v-for="column in columns">
            <b-table-column :key="column.id" v-bind="column">
              <template v-if="column.searchable" slot="searchable" slot-scope="props">
                <b-input v-model="props.filters[props.column.field]" placeholder="Rechercher..." icon="search" size="is-small" />
              </template>
              <template v-slot="props">
                <router-link v-if="column.field==='name'" :to="{name: 'admin-equipment', params: {id: props.row.id}}">{{ props.row.name }}</router-link>
                <i v-else-if="column.field==='isActive'" class="fas fa-fw" :class="props.row.isActive ? 'fa-toggle-on has-text-success' : 'fa-toggle-off has-text-grey'" :title="props.row.isActive ? 'Actif' : 'Inactif'" />
                <i v-else-if="column.field==='isVisible'" class="fas fa-fw" :class="props.row.isVisible ? 'fa-eye has-text-success' : 'fa-eye-slash has-text-grey'" :title="props.row.isVisible ? 'Visible' : 'Masqué'" />
                <time-ago v-else-if="column.field==='lastCommunication' && props.row.lastCommunication" :date="props.row.lastCommunication" :drop-fixes="true" :title="props.row.lastCommunication | moment('LLL')" />
                <span v-else-if="column.field==='battery' && props.row.battery" :class="{'has-text-danger': props.row.battery < 10}">{{ props.row.battery }}%</span>
                <span v-else>{{ props.row[column.field] }}</span>
              </template>
            </b-table-column>
          </template>
        </b-table>
        <span class="buttons">
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
import Breadcrumb from '@/components/Breadcrumb'
import TimeAgo from '@/components/TimeAgo'
import { AdminMixin } from '@/mixins/Admin'

export default {
  name: 'Equipments',
  components: {
    Breadcrumb,
    TimeAgo,
  },
  mixins: [AdminMixin],
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
          field: 'lastCommunication',
          label: 'Dernière communication',
          sortable: true,
        },
        {
          field: 'battery',
          label: 'Batterie',
          sortable: true,
        },
      ],
    }
  },
  computed: {
    processed () {
      return this.arrEquipments.map((equipment) => {
        equipment.roomName = this.getRoomById(equipment.roomId).name || equipment.roomId
        return equipment
      })
    },
  },
  methods: {
    async getEquipments () {
      this.isLoading = true
      await this.vxRefreshEquipments()
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
