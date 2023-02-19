<template>
  <div>
    <o-collapse :open="false" position="top" aria-id="relatedOptions" content-class="pt-4 px-4">

      <template #trigger="props">
        <a aria-controls="relatedOptions" :aria-expanded="props.open">
          <span class="icon-text">
            <span class="icon">
              <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
            </span>
            <span>
              {{ !props.open ? 'Afficher les options' : 'Masquer les options' }}
            </span>
          </span>
        </a>
      </template>

      <div class="field">
        <div class="control">
          <o-switch v-model="useObjectIcon" @change="prepareData">{{ useObjectIcon ? 'Icônes personnalisées' : 'Icônes standards' }}</o-switch>
        </div>
      </div>
      <div class="table-container">
        <table class="table is-fullwidth is-vertical-centered has-text-centered">
          <thead>
            <tr>
              <th class="has-text-centered">Filtres</th>
              <th v-for="(dataLabel, dataType) in dataTypes" :key="dataType" class="has-text-centered">{{ dataLabel }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dataFilters, filterType) in filters" :key="filterType" :class="[filterType === localType ? 'has-text-weight-bold' : 'has-text-weight-light']">
              <td> {{ dataTypes[filterType] }}</td>
              <td v-for="(dataLabel, dataType) in dataTypes" :key="dataType">
                <input v-if="dataFilters.hasOwnProperty(dataType)" v-model="dataFilters[dataType]" type="checkbox">
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </o-collapse>

    <tree-map v-if="checkedTree.children.length" :tree="checkedTree" :is-zoomable="false" :on-click-function="followLink" :on-legend-click-function="navigateToItem" legend-class="tree-node-legend-clickable" />
  </div>
</template>

<script>
import TreeMap from '@/components/TreeMap.vue'
import { useDataStore } from '@/store/data'
import { useEquipmentsHelper } from '@/composables/useEquipmentsHelper'
import { provider } from '@/services/Provider'

export default {
  name: 'Related',
  components: {
    TreeMap,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  setup() {
    const dataStore = useDataStore()
    const { getIconClass } = useEquipmentsHelper()
    return { dataStore, getIconClass }
  },
  data () {
    return {
      localId: this.id,
      localType: this.type,
      localTree: {
        id: this.localId,
        scale: 1,
        children: [],
      },
      raw: {},
      intents: [],
      useObjectIcon: false,
      dataTypes: {
        room: 'Pièces',
        equipment: 'Equipements',
        state: 'Etats',
        action: 'Actions',
        scenario: 'Scénarios',
        channel: 'Canaux',
        view: 'Vues',
        intent: 'Intentions',
      },
      filters: {
        room: {
          room: true,
          equipment: true,
          state: true,
        },
        equipment: {
          room: true,
          state: true,
          action: true,
          view: true,
        },
        state: {
          equipment: true,
          room: true,
          action: true,
          scenario: true,
          channel: true,
          intent: true,
          view: true,
        },
        action: {
          equipment: true,
          state: true,
          scenario: true,
          channel: true,
          intent: true,
          view: true,
        },
        scenario: {
          state: true,
          action: true,
          channel: true,
          intent: true,
        },
        channel: {
          state: true,
          action: true,
          scenario: true,
        },
        view: {
          equipment: true,
          state: true,
          action: true,
        },
        intent: {
          state: true,
          action: true,
          scenario: true,
        },
      },
    }
  },
  computed: {
    checkedTree () {
      return this.checkNodeAndChildren(this.localTree)
    },
  },
  watch: {
    filters: {
      handler() {
        this.prepareData()
      },
      deep: true,
    },
  },
  async mounted () {
    this.intents = await provider.getIntents()
    this.dataStore.vxRefreshChannels()
    this.dataStore.vxLoadScenarios()
    this.getLinks()
  },
  methods: {
    async getLinks() {
      this.raw = await provider.getLinks(this.localType, this.localId)
      this.prepareData()
    },
    prepareData() {
      this.localTree = this.prepareNodeData(this.localType, this.localId,{
        scale: 1.2,
        children: [],
      })
      switch (this.localType) {
        case 'room':
          if (this.filters.room.equipment) {
            this.raw.equipments.forEach(id => this.addChildren('equipment', id, {
              title: 'Équipement localisé dans la pièce',
              linkText: 'Localise',
            }))
          }
          if (this.filters.room.room) {
            this.raw.rooms.forEach(id => this.addChildren('room', id, {
              title: 'Pièce liée',
              linkText: 'Dépend de',
              scale: 0.7,
              strokeDasharray: '3 3',
            }))
          }
          if (this.filters.room.state) {
            this.raw.states.forEach(id => this.addChildren('state', id, {
              title: 'Résumé de la pièce',
              linkText: 'Résumé',
              scale: 0.8,
              strokeDasharray: '8 3',
            }))
          }
          break
        case 'equipment':
          if (this.filters.equipment.room) {
            this.raw.rooms.forEach(id => this.addChildren('room', id, {
              title: 'Pièce contenant l\'équipement',
              linkText: 'Localise',
            }))
          }
          if (this.filters.equipment.state) {
            this.raw.states.forEach(id => this.addChildren('state', id, {
              title: 'Etat de l\'équipement',
              linkText: 'Produit',
            }))
          }
          if (this.filters.equipment.action) {
            this.raw.actions.forEach(id => this.addChildren('action', id, {
              title: 'Action de l\'équipement',
              linkText: 'Permet',
            }))
          }
          if (this.filters.equipment.view) {
            this.raw.userViews.forEach(id => this.addChildren('view', id, {
              title: 'Vue utilisateur affichant l\'équipement',
              linkText: 'Affiche',
            }))
          }
          break
        case 'state':
          if (this.filters.state.equipment) {
            this.raw.equipments.forEach(id => this.addChildren('equipment', id, {
              title: 'Equipement produisant l\'état',
              linkText: 'Produit',
            }))
          }
          if (this.filters.state.room) {
            this.raw.roomsSummary.forEach(id => this.addChildren('room', id, {
              title: 'Pièce utilisant l\'état dans un résumé',
              linkText: 'Résumé',
            }))
          }
          if (this.filters.state.action) {
            this.raw.actionsStateFeedback.forEach(id => this.addChildren('action', id, {
              title: 'Action ayant un retour vers cet état',
              linkText: 'Feedback',
            }))
          }
          if (this.filters.state.scenario) {
            this.raw.scenariosTriggered.forEach(id => this.addChildren('scenario', id, {
              title: 'La mise à jour déclenche le scénario',
              linkText: 'Trigger',
            }))
          }
          if (this.filters.state.scenario) {
            this.raw.scenariosCondition.forEach(id => this.addChildren('scenario', id, {
              title: 'Condition du scénario',
              linkText: 'Condition',
            }))
          }
          if (this.filters.state.scenario) {
            this.raw.scenariosActions.forEach(id => this.addChildren('scenario', id, {
              title: 'Scénario utilisant l\'état dans une action',
              linkText: 'Utilise',
            }))
          }
          if (this.filters.state.channel) {
            this.raw.channels.forEach(id => this.addChildren('channel', id, {
              title: 'Canal de communication utilisant l\'état pour la réception des messages',
              linkText: 'Input',
            }))
          }
          if (this.filters.state.intent) {
            this.raw.intents.forEach(id => this.addChildren('intent', id, {
              title: 'Intention NLP utilisant l\'état',
              linkText: 'Utilise',
            }))
          }
          if (this.filters.state.view) {
            this.raw.userViews.forEach(id => this.addChildren('view', id, {
              title: 'Vue utilisateur affichant l\'état',
              linkText: 'Affiche',
            }))
          }
          break
        case 'action':
          if (this.filters.action.equipment) {
            this.raw.equipments.forEach(id => this.addChildren('equipment', id, {
              title: 'Equipement permettant l\'action',
              linkText: 'Permet',
            }))
          }
          if (this.filters.action.state) {
            this.raw.stateFeedbacks.forEach(id => this.addChildren('state', id, {
              title: 'Etat mis à jour par l\'action',
              linkText: 'Feedback',
            }))
          }
          if (this.filters.action.scenario) {
            this.raw.scenarios.forEach(id => this.addChildren('scenario', id, {
              title: 'Scénario utilisant l\'action',
              linkText: 'Active',
            }))
          }
          if (this.filters.action.channel) {
            this.raw.channels.forEach(id => this.addChildren('channel', id, {
              title: 'Canal de communication utilisant l\'action pour envoyer des messages',
              linkText: 'Output',
            }))
          }
          if (this.filters.action.intent) {
            this.raw.intents.forEach(id => this.addChildren('intent', id, {
              title: 'Intention NLP utilisant l\'action',
              linkText: 'Utilise',
            }))
          }
          if (this.filters.action.view) {
            this.raw.userViews.forEach(id => this.addChildren('view', id, {
              title: 'Vue utilisateur affichant l\'action',
              linkText: 'Affiche',
            }))
          }
          break
        case 'view':
          if (this.filters.view.equipment) {
            this.raw.equipments.forEach(id => this.addChildren('equipment', id, {
              title: 'Équipement affiché dans la vue',
              linkText: 'Affiche',
            }))
          }
          if (this.filters.view.state) {
            this.raw.states.forEach(id => this.addChildren('state', id, {
              title: 'État affiché dans la vue',
              linkText: 'Affiche',
            }))
          }
          if (this.filters.view.action) {
            this.raw.actions.forEach(id => this.addChildren('action', id, {
              title: 'Action affichée dans la vue',
              linkText: 'Affiche',
            }))
          }
          break
        case 'scenario':
          if (this.filters.scenario.state) {
            this.raw.triggerStates.forEach(id => this.addChildren('state', id, {
              title: 'Etat déclenchant le scénario',
              linkText: 'Trigger',
            }))
            this.raw.conditionStates
              .filter(id => id !== 'answer')
              .forEach(id => this.addChildren('state', id, {
                title: 'Etat évalué dans les règles du scénario',
                linkText: 'Condition',
              }))
            this.raw.actionStates.forEach(id => this.addChildren('state', id, {
              title: 'Etat utilisé dans les actions du scénario',
              linkText: 'JSONata',
            }))
          }
          if (this.filters.scenario.action) {
            this.raw.actions.forEach(id => this.addChildren('action', id, {
              title: 'Action utilisée dans le scénario',
              linkText: 'Active',
            }))
          }
          if (this.filters.scenario.channel) {
            this.raw.channels.forEach(id => this.addChildren('channel', id, {
              title: 'Canal utilisé par les demandes du scénario',
              linkText: 'Demande',
            }))
          }
          if (this.filters.scenario.intent) {
            this.raw.intents.forEach(id => this.addChildren('intent', id, {
              title: 'Intention activant le scénario',
              linkText: 'Trigger',
            }))
          }
          break
        case 'channel':
          if (this.filters.channel.state) {
            this.raw.states.forEach(id => this.addChildren('state', id, {
              title: 'Etat utilisé pour la réception les messages du canal',
              linkText: 'Input',
            }))
          }
          if (this.filters.channel.action) {
            this.raw.actions.forEach(id => this.addChildren('action', id, {
              title: 'Action utilisée pour envoyer les messages du canal',
              linkText: 'Output',
            }))
          }
          if (this.filters.channel.scenario) {
            this.raw.scenarios.forEach(id => this.addChildren('scenario', id, {
              title: 'Scénario utilisant le canal de communication pour des demandes',
              linkText: 'Demande',
            }))
          }
          break
        case 'intent':
          if (this.filters.intent.state) {
            this.raw.states.forEach(id => this.addChildren('state', id, {
              title: 'Etat utilisé dans les traitements de l\'intention',
              linkText: 'Lit',
            }))
          }
          if (this.filters.intent.action) {
            this.raw.actions.forEach(id => this.addChildren('action', id, {
              title: 'Action utilisée dans les traitements de l\'intention',
              linkText: 'Active',
            }))
          }
          if (this.filters.intent.scenario) {
            this.raw.scenarios.forEach(id => this.addChildren('scenario', id, {
              title: 'Scenario déclenché par le traitement de l\'intention',
              linkText: 'Trigger',
            }))
          }
          break
      }
    },
    addChildren (type, id, attributes = {}) {
      this.localTree.children.push(this.prepareNodeData(type, id, attributes))
    },
    prepareNodeData (type, id, attributes = {}) {
      switch (type) {
        case 'room': {
          const room = this.dataStore.getRoomById(id)
          return Object.assign({
            id: room.id,
            legend: room.name,
            title: 'Pièce',
            linkText: 'Contient',
            type: 'room',
            icon: this.useObjectIcon ? room.icon || 'fas fa-home' : 'fas fa-home',
            circleColor: room.isVisible
              ? 'rgb(72, 199, 142)'
              : 'rgb(241, 70, 104)',
          }, attributes)
        }
        case 'equipment': {
          const equipment = this.dataStore.getEquipmentById(id)
          return Object.assign({
            id: equipment.id,
            legend: equipment.name,
            title: 'Équipement',
            linkText: 'Affiche',
            type: 'equipment',
            icon: 'fas fa-microchip',
            circleColor: equipment.isActive
              ? 'rgb(72, 199, 142)'
              : 'rgb(241, 70, 104)',
          }, attributes)
        }
        case 'state': {
          const state = this.dataStore.getStateById(id)
          return Object.assign({
            id: state.id,
            legend: state.name,
            title: 'État',
            linkText: 'Affiche',
            type: 'state',
            icon: this.useObjectIcon ? this.getIconClass(state) : 'fas fa-eye',
          }, attributes)
        }
        case 'action': {
          const action = this.dataStore.getActionById(id)
          return Object.assign({
            id: action.id,
            legend: action.name,
            title: 'Action',
            linkText: '',
            type: 'action',
            icon: this.useObjectIcon ? this.getIconClass(action) : 'fas fa-cogs',
          }, attributes)
        }
        case 'scenario': {
          const scenario = this.dataStore.getScenarioById(id)
          return Object.assign({
            id: scenario.id,
            legend: scenario.name,
            title: 'Scénario',
            linkText: '',
            type: 'scenario',
            icon: this.useObjectIcon ? scenario.icon || 'fas fa-book' : 'fas fa-book',
            circleColor: scenario.isActive
              ? 'rgb(72, 199, 142)'
              : 'rgb(241, 70, 104)',
          }, attributes)
        }
        case 'view': {
          const userView = this.dataStore.userViewsList.find(view => view.id === id)
          return Object.assign({
            id: userView.id,
            legend: userView.title,
            title: 'Vue utilisateur',
            linkText: 'Affiche',
            type: 'view',
            icon: this.useObjectIcon ? userView.icon || 'fas fa-binoculars' : 'fas fa-binoculars',
            circleColor: userView.isActive
              ? 'rgb(72, 199, 142)'
              : 'rgb(241, 70, 104)',
          }, attributes)
        }
        case 'channel': {
          const channel = this.dataStore.arrChannels.find(channel => channel.id === id)
          return Object.assign({
            id: channel.id,
            legend: channel.name,
            title: 'Canal de communication',
            linkText: '',
            type: 'channel',
            icon: 'fas fa-comments',
            circleColor: channel.isActive
              ? 'rgb(72, 199, 142)'
              : 'rgb(241, 70, 104)',
          }, attributes)
        }
        case 'intent': {
          const intent = this.intents.find(intent => intent.id === id)
          return Object.assign({
            id: intent.id,
            legend: intent.description,
            title: 'Intention NLP',
            linkText: '',
            type: 'intent',
            icon: 'fas fa-comment-dots',
            circleColor: intent.isActive
              ? 'rgb(72, 199, 142)'
              : 'rgb(241, 70, 104)',
          }, attributes)
        }
      }
    },
    checkNodeAndChildren (node) {
      const children = node.children ? node.children.map(child => this.checkNodeAndChildren(child)) : []
      const _node = Object.assign({
        legend: '?',
        icon: 'fas fa-question',
        circleColor: 'rgb(72, 199, 142)',
        title: node.type,
        linkText: '',
        strokeDasharray: null,
        scale: 1,
        isParent: children.length > 0,
        children: [],
      }, node)
      _node.children = children
      return _node
    },
    followLink (node) {
      if (!node.data.id || !node.data.type) {
        return
      }
      this.localId = node.data.id
      this.localType = node.data.type
      this.getLinks()
    },
    navigateToItem (node) {
      if (!node.data.id || !node.data.type) {
        return
      }
      switch (node.data.type) {
        case 'room':
          this.$router.push({ name: 'admin-room', params: { id: node.data.id } })
          break
        case 'equipment':
          this.$router.push({ name: 'admin-equipment', params: { id: node.data.id } })
          break
        case 'state':
          this.$router.push({ name: 'admin-state', params: { id: node.data.id } })
          break
        case 'action':
          this.$router.push({ name: 'admin-action', params: { id: node.data.id } })
          break
        case 'scenario':
          this.$router.push({ name: 'admin-scenario', params: { id: node.data.id } })
          break
        case 'view':
          this.$router.push({ name: 'admin-view', params: { id: node.data.id } })
          break
        case 'channel':
          this.$router.push({ name: 'admin-channel', params: { id: node.data.id } })
          break
        case 'intent':
          this.$router.push({ name: 'admin-intent', params: { id: node.data.id } })
          break
      }
      return false
    },
  },
}
</script>
