<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-nlp'}, icon: 'fa-brain', text: 'Traitement automatique du langage naturel'}, {link: {}, icon: 'fa-cubes', text: 'Entités', isActive: true}, {link: {name: 'admin-entity', params: {id}}, text: entity.key, isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <o-loading v-model:active="isLoading" :full-page="false" />
        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-cube" /></span><span>Informations de l'entité</span>
            </p>
          </header>
          <section class="card-content">
            <div class="field is-required">
              <label class="label">Clé</label>
              <div class="control has-icons-left">
                <input v-model="entity.key" class="input" type="text" placeholder="Clé de l'entité">
                <span class="icon is-small is-left">
                  <i class="fas fa-tag" />
                </span>
              </div>
            </div>
            <div class="field is-required">
              <label class="label">Description</label>
              <div class="control has-icons-left">
                <input v-model="entity.description" class="input" type="text" placeholder="Description de l'entité">
                <span class="icon is-small is-left">
                  <i class="fas fa-info" />
                </span>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <label class="label">Statut</label>
                <o-switch v-model="entity.isActive">{{ entity.isActive ? 'Actif' : 'Inactif' }}</o-switch>
              </div>
            </div>
            <div class="buttons">
              <button class="button is-primary" title="Sauvegarder l'entité" @click="saveEntity">
                <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Rafraichir l'entité" @click="getEntity">
                <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Dupliquer l'entité" @click="copyEntity">
                <span class="icon"><i class="fa fa-copy" /></span><span>Dupliquer</span>
              </button>
              <button v-if="!isNew" class="button is-danger" title="Supprimer l'entité" @click="removeEntity">
                <span class="icon"><i class="fa fa-trash" /></span><span>Supprimer</span>
              </button>
            </div>
          </section>
        </div>

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-cube" /></span><span>Options de l'entité</span>
            </p>
          </header>
          <section class="card-content">
            <div class="table-container">
              <table class="table is-striped is-fullwidth is-vertical-centered has-buttons">
                <thead>
                  <tr>
                    <th class="is-required">Option</th>
                    <th>Alias</th>
                    <th class="is-button" />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(option, index) in entity.options" :key="index">
                    <td>
                      <editable :value="option.key" icon-class="fa fa-cube" placeholder="Salon" :is-emptiable="false" @update="(value) => option.key = value" />
                    </td>
                    <td>
                      <div v-for="(alias, indexAlias) in option.aliases" :key="indexAlias" class="field is-required">
                        <editable read-only-class="py-2" :value="alias.value" icon-class="fa fa-cube" placeholder="Salon" is-removable @remove="() => updateAlias(option, indexAlias, '')" @update="(value) => updateAlias(option, indexAlias, value)" />
                      </div>
                      <button class="button is-primary is-light" title="Ajouter un alias" @click="addAlias(option)">
                        <span class="icon"><i class="fa fa-plus-circle" /></span>
                      </button>
                    </td>
                    <td>
                      <button class="button is-danger is-light" title="Supprimer l'option" @click="removeOption(index)">
                        <span class="icon"><i class="fa fa-trash" /></span>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="field is-required">
                        <div class="control has-icons-left">
                          <input v-model="newOption.key" class="input" type="text" placeholder="Salon" @keyup.enter="addOption">
                          <span class="icon is-small is-left">
                            <i class="fa fa-cube" />
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div v-for="(alias, index) in newOption.aliases" :key="index" class="field">
                        <div class="control has-icons-left">
                          <input v-model="alias.value" class="input" type="text" placeholder="Salon" @keyup.enter="addOption" @input="handleAlias(alias.value, index)">
                          <span class="icon is-small is-left">
                            <i class="fa fa-cube" />
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button :disabled="newOption.key === ''" class="button is-primary is-light" title="Ajouter une option" @click="addOption">
                        <span class="icon"><i class="fa fa-plus-circle" /></span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <o-collapse class="card mb-4" animation="slide" aria-id="relatedIntents" :open="false" @open="getRelatedIntents">
          <template #trigger="props">
            <header class="card-header" role="button" aria-controls="relatedIntents">
              <p class="card-header-title">
                <span class="icon"><i class="fa fa-comment-dots" /></span><span>Intentions utilisant cette entité</span>
              </p>
              <a class="card-header-icon">
                <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
              </a>
            </header>
          </template>
          <section class="card-content">
            <div v-if="relatedIntents.length" class="table-container">
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
                  <tr v-for="intent in relatedIntents" :key="intent.id">
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
            <span v-else>Cette entité n'est utilisée dans aucune intention</span>
          </section>
        </o-collapse>

        <o-collapse class="card mb-4" animation="slide" aria-id="summaryQuery" :open="false">
          <template #trigger="props">
            <header class="card-header" role="button" aria-controls="summaryQuery">
              <p class="card-header-title">
                <span class="icon"><i class="fa fa-heartbeat" /></span><span>Générer des options depuis des résumés (pièces)</span>
              </p>
              <a class="card-header-icon">
                <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
              </a>
            </header>
          </template>
          <section class="card-content">
            <div class="field is-required">
              <label class="label">Type</label>
              <div class="control has-icons-left">
                <span class="select">
                  <select v-model="summaryQuery.key">
                    <option v-for="summaryKey in summaryKeys" :key="summaryKey.key" :value="summaryKey.key">{{ summaryKey.label }}</option>
                  </select>
                </span>
                <div class="icon is-small is-left">
                  <i class="fa" :class="getSummaryIconClass(summaryQuery.key.toLowerCase())" />
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label">Pièce</label>
              <div class="control has-icons-left">
                <input v-model="summaryQuery.name" class="input" type="text" placeholder="Salon">
                <span class="icon is-small is-left">
                  <i class="fa fa-home" />
                </span>
              </div>
            </div>
            <div class="field">
              <label class="label">Résultats</label>
              <o-tooltip v-if="summaryResult.length > 0" position="bottom" variant="dark" class="control is-dashed">
                <span>{{ summaryResult.length }}</span>
                <template #content>
                  <div v-for="summary in summaryResult" :key="summary.id">
                    {{ summary.name }}
                  </div>
                </template>
              </o-tooltip>
              <div v-else class="control">0</div>
            </div>
            <button class="button is-primary" :disabled="summaryResult.length === 0" title="Générer les options" @click="generateOptionsFromSummary">
              <span class="icon"><i class="fa fa-cog" /></span>
              <span>Générer</span>
            </button>
          </section>
        </o-collapse>

        <o-collapse class="card mb-4" animation="slide" aria-id="actionOptionsQuery" :open="false">
          <template #trigger="props">
            <header class="card-header" role="button" aria-controls="actionOptionsQuery">
              <p class="card-header-title">
                <span class="icon"><i class="fas fa-cogs" /></span><span>Générer des options depuis la liste de valeurs d'une action</span>
              </p>
              <a class="card-header-icon">
                <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
              </a>
            </header>
          </template>
          <section class="card-content">
            <div class="field is-required">
              <label class="label">Action</label>
              <div class="control has-icons-left">
                <options-autocomplete placeholder="Action à utiliser" type="action" :value="actionOptionsQuery.actionId" :filter="(a) => a.type === 'select'" @select="(selected) => actionOptionsQuery.actionId = selected ? selected.id : null" />
              </div>
            </div>
            <div class="field">
              <div class="control">
                <label class="label">Utiliser le libellé de l'option de l'action en tant qu'option</label>
                <o-switch v-model="actionOptionsQuery.useLabel">{{ actionOptionsQuery.useLabel ? 'Libellé' : 'Valeur' }}</o-switch>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <label class="label">Créer un alias de l'option avec {{ actionOptionsQuery.useLabel ? 'la valeur' : 'le libellé' }} de l'option de l'action</label>
                <o-switch v-model="actionOptionsQuery.createAliases">{{ actionOptionsQuery.createAliases ? 'Oui' : 'Non' }}</o-switch>
              </div>
            </div>
            <div class="field">
              <label class="label">Résultats</label>
              <o-tooltip v-if="actionOptionsResult.length > 0" position="bottom" variant="dark" class="control is-dashed">
                <span>{{ actionOptionsResult.length }}</span>
                <template #content>
                  <div v-for="option in actionOptionsResult" :key="option">
                    {{ option.key }}{{ actionOptionsQuery.createAliases ? ` (alias : ${option.aliases.map(a => a.value).join('')})` : '' }}
                  </div>
                </template>
              </o-tooltip>
              <div v-else class="control">0</div>
            </div>
            <button class="button is-primary" :disabled="actionOptionsResult.length === 0" title="Générer les options" @click="generateOptionsFromactionOptions">
              <span class="icon"><i class="fa fa-cog" /></span>
              <span>Générer</span>
            </button>
          </section>
        </o-collapse>

        <o-collapse class="card mb-4" animation="slide" aria-id="statesQuery" :open="false">
          <template #trigger="props">
            <header class="card-header" role="button" aria-controls="statesQuery">
              <p class="card-header-title">
                <span class="icon"><i class="fa fa-eye" /></span><span>Générer des options depuis des états (état équipement)</span>
              </p>
              <a class="card-header-icon">
                <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
              </a>
            </header>
          </template>
          <section class="card-content">
            <div class="field">
              <label class="label">Module</label>
              <div class="control has-icons-left">
                <input v-model="statesQuery.module" class="input" type="text" placeholder="Module">
                <span class="icon is-small is-left">
                  <i class="fa fa-cogs" />
                </span>
              </div>
            </div>
            <div class="field">
              <label class="label">Equipement</label>
              <div class="control has-icons-left">
                <input v-model="statesQuery.equipmentName" class="input" type="text" placeholder="Equipement">
                <span class="icon is-small is-left">
                  <i class="fa fa-microchip" />
                </span>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <label class="label">Statut de l'équipement</label>
                <o-switch v-model="statesQuery.equipmentOnlyIsActive">{{ statesQuery.equipmentOnlyIsActive ? 'Actifs uniquement' : 'Tous' }}</o-switch>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <label class="label">Visibilité de l'équipement</label>
                <o-switch v-model="statesQuery.equipmentOnlyIsVisible">{{ statesQuery.equipmentOnlyIsVisible ? 'Visibles uniquement' : 'Tous' }}</o-switch>
              </div>
            </div>
            <div class="field">
              <label class="label">Nom de l'état</label>
              <div class="control has-icons-left">
                <input v-model="statesQuery.stateName" class="input" type="text" placeholder="Etat">
                <span class="icon is-small is-left">
                  <i class="fa fa-eye" />
                </span>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <label class="label">Visibilité de l'état</label>
                <o-switch v-model="statesQuery.stateOnlyIsVisible">{{ statesQuery.stateOnlyIsVisible ? 'Visibles uniquement' : 'tous' }}</o-switch>
              </div>
            </div>
            <div class="field">
              <label class="label">Résultats</label>
              <o-tooltip v-if="statesResult.length > 0" variant="dark" class="control is-dashed">
                <span>{{ statesResult.length }}</span>
                <template #content>
                  <div v-for="state in statesResult" :key="state.id">
                    {{ state.name }} {{ state.equipmentName }}
                  </div>
                </template>
              </o-tooltip>
              <div v-else class="control">0</div>
            </div>
            <button class="button is-primary" :disabled="statesResult.length === 0" title="Générer les options" @click="generateOptionsFromStates">
              <span class="icon"><i class="fa fa-cog" /></span>
              <span>Générer</span>
            </button>
          </section>
        </o-collapse>

      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
import Editable from '@/components/admin/Editable.vue'
import OptionsAutocomplete from '@/components/admin/OptionsAutocomplete.vue'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { useSummary } from '@/composables/useSummary'
import { useAppStore } from '@/store/app'
import { useDataStore } from '@/store/data'
import { useDialog } from '@/composables/useDialog'
import { provider } from '@/services/Provider'

export default {
  name: 'Entity',
  components: {
    Breadcrumb,
    Editable,
    OptionsAutocomplete,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup() {
    const appStore = useAppStore()
    const dataStore = useDataStore()
    const { summaryKeys, getSummaryIconClass } = useSummary()
    const { confirmDelete } = useDialog()
    const { addUnsavedChangesGuard, removeUnsavedChangesGuard } = useUnsavedChangesGuard()
    return { appStore, dataStore, summaryKeys, getSummaryIconClass, confirmDelete, addUnsavedChangesGuard, removeUnsavedChangesGuard }
  },
  data () {
    return {
      entity: {
        key: '',
        description: '',
        isActive: true,
        options: [],
      },
      newOption: {
        key: '',
        aliases: [{ value: '' }],
      },
      relatedIntents: [],
      summaryQuery: {
        name: '',
        key: '',
      },
      statesQuery: {
        module: '',
        equipmentName: '',
        equipmentOnlyIsActive: true,
        equipmentOnlyIsVisible: true,
        stateName: '',
        stateOnlyIsVisible: true,
      },
      actionOptionsQuery: {
        actionId: null,
        useLabel: false,
        createAliases: false,
      },
      isLoading: false,
    }
  },
  computed: {
    isNew () {
      return this.id === 'new'
    },
    summaryResult () {
      if (this.summaryQuery.key === '') {
        return []
      }
      return Object.values(this.dataStore.rooms)
        .filter((room) => {
          return (
            (room.summary && room.summary.length > 0) &&
            (this.summaryQuery.name === '' || room.name.toLowerCase().includes(this.summaryQuery.name.toLowerCase())) &&
            (room.summary.some((summary) => summary.key === this.summaryQuery.key.toLowerCase()))
          )
        })
    },
    statesResult () {
      return this.dataStore.arrStatesWithEquipmentName
        .filter((state) => {
          return (
            (this.statesQuery.module === '' || (state.module && state.module.toLowerCase().includes(this.statesQuery.module.toLowerCase()))) &&
            (this.statesQuery.equipmentName === '' || state.equipmentName.toLowerCase().includes(this.statesQuery.equipmentName.toLowerCase())) &&
            (this.statesQuery.stateName === '' || state.name.toLowerCase().includes(this.statesQuery.stateName.toLowerCase())) &&
            (!this.statesQuery.equipmentOnlyIsActive || state.equipmentIsActive) &&
            (!this.statesQuery.equipmentOnlyIsVisible || state.equipmentIsVisible) &&
            (!this.statesQuery.stateOnlyIsVisible || state.isVisible)
          )
        })
    },
    actionOptionsResult () {
      if (!this.actionOptionsQuery.actionId) {
        return []
      }
      const action = this.dataStore.getActionById(this.actionOptionsQuery.actionId)
      if (!action || !Array.isArray(action.options)) {
        return []
      }
      return action.options
        .map(option => {
          return {
            key: this.actionOptionsQuery.useLabel ? option.label : option.value,
            aliases: this.actionOptionsQuery.createAliases ? [{ value: option.value }, { value: option.label }] : [],
          }
        })
    },
  },
  mounted () {
    this.getEntity()
  },
  methods: {
    async getEntity () {
      if (!this.isNew) {
        this.isLoading = true
        try {
          this.entity = await provider.getEntity(this.id)
          this.addUnsavedChangesGuard(this.entity)
        } catch (error) {
          this.appStore.setInformation({ type: 'is-danger', message: error.message })
        }
        this.isLoading = false
      } else {
        this.addUnsavedChangesGuard(this.entity)
        if (history.state.proposal) {
          this.entity = Object.assign({}, this.entity, history.state.proposal)
        }
      }
    },
    async saveEntity () {
      this.isLoading = true
      try {
        if (this.isNew) {
          this.entity = await provider.createEntity(this.entity)
          this.addUnsavedChangesGuard(this.entity)
          this.$router.replace({ name: this.$route.name, params: { id: this.entity.id } })
        } else {
          this.entity = await provider.updateEntity(this.entity)
          this.addUnsavedChangesGuard(this.entity)
        }
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async removeEntity () {
      if (await this.confirmDelete('L\'entité sera supprimée.')) {
        this.isLoading = true
        try {
          await provider.deleteEntity(this.entity.id)
          this.removeUnsavedChangesGuard()
          this.$router.back()
        } catch (error) {
          this.appStore.setInformation({ type: 'is-danger', message: error.message })
        }
        this.isLoading = false
      }
    },
    copyEntity () {
      const proposal = JSON.parse(JSON.stringify(this.entity))
      delete proposal.id
      proposal.key = `${proposal.key}.copie`
      proposal.description = `${proposal.description} (copie)`
      this.$router.push({
        name: 'admin-entity',
        params: {
          id: 'new',
        },
        state: {
          proposal,
        },
      }).catch(() => {})
    },
    removeOption (index) {
      this.entity.options.splice(index, 1)
    },
    addOption () {
      if (this.newOption.key === '') {
        return
      }
      const option = Object.assign({}, this.newOption)
      option.aliases = option.aliases
        .filter((alias) => alias.value !== '')
      this.entity.options.push(option)
      this.newOption = {
        key: '',
        aliases: [{ value: '' }],
      }
    },
    addAlias (option) {
      option.aliases.push({ value: option.key })
    },
    updateAlias (option, index, value) {
      if (value === undefined || value === '') {
        option.aliases.splice(index, 1)
        return
      }
      option.aliases[index].value = value
    },
    handleAlias (parameter, index) {
      if (parameter !== '') {
        if (index === this.newOption.aliases.length - 1) {
          // setting last input, add a new one
          this.newOption.aliases.push({ value: '' })
        }
      } else {
        if (this.newOption.aliases[this.newOption.aliases.length - 1].value === '') {
          // clearing last input, remove empty input
          this.newOption.aliases.splice(index, 1)
        }
      }
    },
    async getRelatedIntents () {
      this.isLoading = true
      try {
        this.relatedIntents = (await provider.getIntents())
          .filter((intent) => intent.utterances
            .some((utterance) => utterance.value.indexOf(`%${this.entity.key}%`) !== -1),
          )
          .sort((a, b) => a.key > b.key ? 1 : -1)
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    generateOptionsFromSummary () {
      this.summaryResult
        .map((room) => `${room.name}`)
        .forEach((candidate) => {
          if (!this.entity.options.some((option) => option.key === candidate)) {
            this.entity.options.push({ key: candidate, aliases: [] })
          }
        })
    },
    generateOptionsFromStates () {
      this.statesResult
        .map((state) => `${state.name} ${state.equipmentName}`)
        .forEach((candidate) => {
          if (!this.entity.options.some((option) => option.key === candidate)) {
            this.entity.options.push({ key: candidate, aliases: [] })
          }
        })
    },
    generateOptionsFromactionOptions () {
      this.actionOptionsResult
        .forEach((candidate) => {
          if (!this.entity.options.some((option) => option.key === candidate.key)) {
            this.entity.options.push({ key: candidate.key, aliases: candidate.aliases })
          }
        })
    },
  },
}
</script>
