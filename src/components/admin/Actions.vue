<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-actions'}, icon: 'fa-cogs', text: 'Actions', isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <o-loading v-model:active="isLoading" :full-page="false" />
        <o-table v-model:checked-rows="checkedRows" :data="processed" :paginated="true" checkable :header-checkable="false" striped hoverable :mobile-cards="false" sort-icon="caret-up" default-sort="equipmentName" class="is-clickable" @click="consultAction">
          <o-table-column v-for="column in columns" v-bind="column" :key="column.id">
            <template v-if="column.searchable" #searchable="props">
              <o-input v-model="props.filters[props.column.field]" placeholder="Rechercher..." icon="search" size="small" />
            </template>
            <template #default="props">
              <router-link v-if="column.field==='name'" :to="{name: 'admin-action', params: {id: props.row.id}}">{{ props.row.name }}</router-link>
              <span v-else-if="column.field==='typeClass'" :title="props.row.type"><i class="fa-fw" :class="props.row.typeClass" /></span>
              <span v-else-if="column.field==='icon'" :title="props.row.icon"><i class="fa-fw" :class="props.row.icon" /></span>
              <i v-else-if="column.field==='isVisible'" class="fas fa-fw" :class="props.row.isVisible ? 'fa-eye has-text-success' : 'fa-eye-slash has-text-grey'" :title="props.row.isVisible ? 'Visible' : 'Masqué'" />
              <i v-else-if="column.field==='isAsk'" class="fas fa-fw" :class="{'fa-comments has-text-success': props.row.isAsk}" :title="props.row.isVisible ? 'Visible' : 'Masqué'" />
              <span v-else>{{ props.row[column.field] }}</span>
            </template>
          </o-table-column>
          <template #bottom-left>
            <span v-if="checkedRows.length" class="buttons">
              <button class="button is-primary is-light" title="Afficher les actions sélectionnées" @click="setActionsVisible(true)">
                <span class="icon"><i class="fa fa-eye" /></span><span>Afficher</span>
              </button>
              <button class="button is-primary is-light" title="Masquer les actions sélectionnées" @click="setActionsVisible(false)">
                <span class="icon"><i class="fa fa-eye-slash" /></span><span>Masquer</span>
              </button>
            </span>
          </template>
        </o-table>
        <span class="buttons pt-3">
          <button class="button is-primary" @click="getActions">
            <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
          </button>
          <button class="button is-primary" @click="createAction">
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
import { useEquipmentsHelper } from '@/composables/useEquipmentsHelper'

export default {
  name: 'Actions',
  components: {
    Breadcrumb,
  },
  setup() {
    const dataStore = useDataStore()
    const { getActionTypeClass, getIconClass } = useEquipmentsHelper()
    return { dataStore, getActionTypeClass, getIconClass }
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
          field: 'typeClass',
          label: 'Type',
          sortable: true,
        },
        {
          field: 'icon',
          label: 'Icône',
          sortable: true,
        },
        {
          field: 'isVisible',
          label: 'Visibilité',
          sortable: true,
        },
        {
          field: 'isAsk',
          label: 'Demande',
          sortable: true,
        },
        {
          field: 'stateFeedback',
          label: 'Retour d\'état',
          searchable: true,
          sortable: true,
        },
      ],
      checkedRows: [],
    }
  },
  computed: {
    processed () {
      return this.dataStore.arrActions.map((action) => {
        const _action = Object.assign({}, action)
        _action.equipmentName = this.dataStore.getEquipmentById(action.eqId).name || action.eqId
        _action.typeClass = this.getActionTypeClass(action.type)
        _action.icon = this.getIconClass(action)
        _action.stateFeedback = Object.prototype.hasOwnProperty.call(this.dataStore.states, action.stateFeedbackId) ? this.dataStore.states[action.stateFeedbackId].name || action.stateFeedbackId : action.stateFeedbackId
        return _action
      })
    },
  },
  methods: {
    async getActions () {
      this.isLoading = true
      await this.dataStore.vxRefreshActions()
      this.isLoading = false
    },
    consultAction (action) {
      this.$router.push({ name: 'admin-action', params: { id: action.id } })
    },
    async setActionsVisible (isVisible) {
      this.isLoading = true
      await Promise.all(this.checkedRows.map(async (row) => {
        if (row.isVisible !== isVisible) {
          const action = Object.assign({}, row)
          delete action.equipmentName
          delete action.typeClass
          delete action.stateFeedback
          action.isVisible = isVisible
          await this.dataStore.vxSaveAction({ action, isNew: false })
        }
      }))
      this.checkedRows = []
      this.isLoading = false
    },
    createAction () {
      this.$router.push({ name: 'admin-action', params: { id: 'new' } })
    },
  },
}
</script>
