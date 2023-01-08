<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-states'}, icon: 'fa-eye', text: 'États', isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <o-loading v-model:active="isLoading" :full-page="false" />
        <o-table v-model:checked-rows="checkedRows" :data="processed" :debounce-search="300" :paginated="true" checkable :header-checkable="false" striped hoverable :mobile-cards="false" sort-icon="caret-up" default-sort="equipmentName" class="is-clickable" @click="consultState">
          <o-table-column v-for="column in columns" v-bind="column" :key="column.field">
            <template v-if="column.searchable" #searchable="props">
              <o-input v-model="props.filters[props.column.field]" placeholder="Rechercher..." icon="search" size="small" />
            </template>
            <template #default="props">
              <router-link v-if="column.field==='name'" :to="{name: 'admin-state', params: {id: props.row.id}}">{{ props.row.name }}</router-link>
              <i v-else-if="column.field==='isVisible'" class="fas fa-fw" :class="props.row.isVisible ? 'fa-eye has-text-success' : 'fa-eye-slash has-text-grey'" :title="props.row.isVisible ? 'Visible' : 'Masqué'" />
              <i v-else-if="column.field==='isHistorized'" :class="{'fas fa-fw fa-history has-text-success': props.row.isHistorized}" :title="props.row.isVisible ? 'Historisé' : null" />
              <time-ago v-else-if="column.field==='date' && props.row.date" :date="props.row.date" :drop-fixes="true" title-format="PPPPpp" />
              <i v-else-if="column.field==='type'" :title="props.row.type" class="fa-fw" :class="getStateTypeClass(props.row.type)" />
              <i v-else-if="column.field==='genericType'" :title="props.row.genericType" class="fa-fw" :class="getIconClass(props.row)" />
              <span v-else>{{ props.row[column.field] }}</span>
            </template>
          </o-table-column>
          <template #bottom-left>
            <span v-if="checkedRows.length" class="buttons">
              <button class="button is-primary is-light" title="Afficher les états sélectionnés" @click="setStatesVisible(true)">
                <span class="icon"><i class="fa fa-eye" /></span><span>Afficher</span>
              </button>
              <button class="button is-primary is-light" title="Masquer les états sélectionnés" @click="setStatesVisible(false)">
                <span class="icon"><i class="fa fa-eye-slash" /></span><span>Masquer</span>
              </button>
            </span>
          </template>
        </o-table>
        <span class="buttons pt-3">
          <button class="button is-primary" @click="getStates">
            <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
          </button>
          <button class="button is-primary" @click="createState">
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
import { useEquipmentsHelper } from '@/composables/useEquipmentsHelper'

export default {
  name: 'States',
  components: {
    Breadcrumb,
    TimeAgo,
  },
  setup() {
    const dataStore = useDataStore()
    const { getStateTypeClass, getIconClass, getFormattedStateCurrentValue } = useEquipmentsHelper()
    return { dataStore, getStateTypeClass, getIconClass, getFormattedStateCurrentValue }
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
          field: 'equipmentName',
          label: 'Équipement',
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
          field: 'type',
          label: 'Type',
          sortable: true,
        },
        {
          field: 'genericType',
          label: 'Icône',
          sortable: true,
        },
        {
          field: 'isVisible',
          label: 'Visibilité',
          sortable: true,
        },
        {
          field: 'isHistorized',
          label: 'Historisé',
          sortable: true,
        },
        {
          field: 'date',
          label: 'Dernière collecte',
          sortable: true,
        },
        {
          field: 'currentValue',
          label: 'Valeur',
          sortable: true,
        },
      ],
      checkedRows: [],
    }
  },
  computed: {
    processed () {
      return this.dataStore.arrStates.map((state) => {
        return {
          ...state,
          equipmentName: this.dataStore.getEquipmentById(state.eqId).name || state.eqId,
          currentValue: this.getFormattedStateCurrentValue(state),
        }
      })
    },
  },
  methods: {
    async getStates () {
      this.isLoading = true
      await this.dataStore.vxRefreshStates()
      this.isLoading = false
    },
    consultState (state) {
      this.$router.push({ name: 'admin-state', params: { id: state.id } })
    },
    async setStatesVisible (isVisible) {
      this.isLoading = true
      await Promise.all(this.checkedRows.map(async (row) => {
        if (row.isVisible !== isVisible) {
          const state = {
            id: row.id,
            isVisible,
          }
          await this.dataStore.vxSaveState({ state, isNew: false })
        }
      }))
      this.checkedRows = []
      this.isLoading = false
    },
    createState () {
      this.$router.push({ name: 'admin-state', params: { id: 'new' } })
    },
  },
}
</script>
