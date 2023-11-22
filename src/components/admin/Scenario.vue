<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-scenarios'}, icon: 'fa-book', text: 'Scenarios'}, {link: {name: 'admin-scenario', params: {id}}, text: scenario.name, isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <o-loading v-model:active="isLoading" :full-page="false" />

        <related-collapsable :id="id" type="scenario" />

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-book" /></span><span>Informations</span>
            </p>
          </header>
          <section class="card-content">
            <div class="field is-required">
              <label class="label">Nom</label>
              <div class="control has-icons-left">
                <input v-model="scenario.name" class="input" type="text" placeholder="Nom court du scénario">
                <span class="icon is-small is-left">
                  <i class="fas fa-tag" />
                </span>
              </div>
            </div>

            <div class="field">
              <label class="label">Description</label>
              <div class="control has-icons-left">
                <input v-model="scenario.description" class="input" type="text" placeholder="Description des traitements du scénario">
                <span class="icon is-small is-left">
                  <i class="fas fa-info" />
                </span>
              </div>
            </div>

            <div class="field">
              <label class="label">Groupe</label>
              <div class="control has-icons-left">
                <input v-model="scenario.group" class="input" type="text" placeholder="Groupe du scénario (Météo, Volets, ...)">
                <span class="icon is-small is-left">
                  <i class="fas fa-layer-group" />
                </span>
              </div>
            </div>

            <div class="field">
              <label class="label">Statut</label>
              <div class="control">
                <o-switch v-model="scenario.isActive">{{ scenario.isActive ? 'Actif' : 'Inactif' }}</o-switch>
              </div>
            </div>

            <div class="field">
              <label class="label">Visibilité</label>
              <div class="control">
                <o-switch v-model="scenario.isVisible">{{ scenario.isVisible ? 'Visible' : 'Masqué' }}</o-switch>
              </div>
            </div>

            <div class="field">
              <label class="label">Exécution synchrone</label>
              <div class="control">
                <o-switch v-model="scenario.isSync">{{ scenario.isSync ? 'Synchrone (traitements des éléments l\'un après l\'autre)' : 'Asynchrone (traitements des éléments en parallèle)' }}</o-switch>
              </div>
            </div>

            <div class="field">
              <label class="label">Déclencheur</label>
              <div class="control">
                <div class="table-container">
                  <table class="table is-striped is-vertical-centered">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Valeur</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(trigger, index) in scenario.triggers" :key="index">
                        <td>{{ (trigger.type === 'state') ? 'Etat' : 'Date' }}</td>
                        <td v-if="trigger.type === 'state'">{{ dataStore.getStateFullName(trigger.value) }}</td>
                        <td v-else>
                          <editable :value="trigger.value" tag="code" icon-class="fas fa-bell" placeholder="ss mm hh jj MMM JJJ" @update="(value) => trigger.value = value" />
                          <span class="help" :class="checkCronTime(trigger.value).isValid ? 'is-success' : 'is-danger'">{{ checkCronTime(trigger.value).result }}</span>
                        </td>
                        <td>
                          <button class="button is-danger is-light" title="Supprimer le déclencheur" @click="removeTrigger(index)">
                            <span class="icon"><i class="fa fa-trash" /></span>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="field is-narrow">
                            <div class="control">
                              <div class="select">
                                <select v-model="newTrigger.type">
                                  <option value="state">Etat</option>
                                  <option value="datetime">Date</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="field is-required">
                            <options-autocomplete v-if="newTrigger.type === 'state'" placeholder="Etat de déclenchement" :value="newTrigger.value" @select="selectState" />
                            <div v-else>
                              <div class="control has-icons-left">
                                <input v-model="newTrigger.dateValue" class="input" type="text" placeholder="ss mm hh jj MMM JJJ" @input="checkTriggerCronTime">
                                <span class="icon is-small is-left">
                                  <i class="fa fa-bell" />
                                </span>
                              </div>
                              <span class="help" :class="newTrigger.isCronValid ? 'is-success' : 'is-danger'">{{ newTrigger.cronResult }}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <button class="button is-primary is-light" title="Ajouter un déclencheur" @click="addTrigger">
                            <span class="icon"><i class="fa fa-plus-circle" /></span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label">Dernière exécution</label>
              <div class="control has-icons-left">
                <input v-model="lastExecution" class="input" type="datetime" readonly disabled>
                <span class="icon is-small is-left">
                  <i class="far fa-clock" />
                </span>
              </div>
            </div>

            <div class="buttons">
              <button class="button is-primary" title="Sauvegarder le scénario" @click="saveScenario">
                <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Rafraichir le scénario" @click="getScenario">
                <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Dupliquer le scénario" @click="copyScenario">
                <span class="icon"><i class="fa fa-copy" /></span><span>Dupliquer</span>
              </button>
              <button v-if="!isNew" class="button is-danger" title="Supprimer le scénario" @click="removeScenario">
                <span class="icon"><i class="fa fa-trash" /></span><span>Supprimer</span>
              </button>
            </div>
          </section>
        </div>

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-tasks" /></span><span>Éléments</span>
            </p>
          </header>
          <section class="card-content">

            <scenario-element v-for="(element, index) in scenario.elements" :key="index" :element="element" :index="index" :length="scenario.elements.length" @remove="removeElement" @up="upElement" @down="downElement" />

            <div class="field is-grouped">
              <div class="control">
                <div class="select">
                  <select v-model="elementType">
                    <option value="rule">Règle</option>
                    <option value="action">Action</option>
                    <option value="ask">Demande</option>
                  </select>
                </div>
              </div>
              <div class="control">
                <button class="button is-primary is-light" :title="`Ajouter un élément de type '${elementType}'`" @click="addElement">
                  <span class="icon"><i class="fa fa-plus-circle" /></span>
                  <span>Élément</span>
                </button>
              </div>
            </div>

            <div class="buttons">
              <button class="button is-primary" title="Sauvegarder le scénario" @click="saveScenario">
                <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Tester le scénario" @click="testScenario">
                <span class="icon"><i class="fa fa-cogs" /></span><span>Tester</span>
              </button>
            </div>
          </section>
        </div>

      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
import ScenarioElement from '@/components/admin/ScenarioElement.vue'
import OptionsAutocomplete from '@/components/admin/OptionsAutocomplete.vue'
import RelatedCollapsable from '@/components/admin/RelatedCollapsable.vue'
import Editable from '@/components/admin/Editable.vue'
import { useAppStore } from '@/store/app'
import { useDataStore } from '@/store/data'
import { useDialog } from '@/composables/useDialog'
import { useConversions } from '@/composables/useConversions'
import { useScenarioHelper } from '@/composables/useScenarioHelper'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { dtFormat } from '@/services/Datetime'
import { provider } from '@/services/Provider'

export default {
  name: 'Scenario',
  components: {
    Breadcrumb,
    ScenarioElement,
    OptionsAutocomplete,
    RelatedCollapsable,
    Editable,
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
    const { addUnsavedChangesGuard, removeUnsavedChangesGuard } = useUnsavedChangesGuard()
    const { confirmDelete } = useDialog()
    const { getHumanCronTime, checkCronTime } = useConversions()
    const { createScenarioElement } = useScenarioHelper()
    return { appStore, dataStore, addUnsavedChangesGuard, removeUnsavedChangesGuard, confirmDelete, getHumanCronTime, checkCronTime, createScenarioElement }
  },
  data () {
    return {
      scenario: {
        isVisible: false,
        isActive: false,
        triggers: [],
        elements: [],
      },
      elementType: 'rule',
      isLoading: false,
      newTrigger: {
        type: 'state',
        value: null,
        dateValue: '0 * * * * *',
        isCronValid: true,
        cronResult: '',
      },
    }
  },
  computed: {
    isNew () {
      return this.id === 'new'
    },
    lastExecution () {
      return this.scenario.lastExecution ? dtFormat(this.scenario.lastExecution, 'PPPpp') : null
    },
  },
  mounted () {
    this.getScenario()
  },
  methods: {
    async getScenario () {
      if (!this.isNew) {
        this.isLoading = true
        try {
          this.scenario = await provider.getScenario(this.id)
          this.addUnsavedChangesGuard(this.scenario)
        } catch (error) {
          this.appStore.setInformation({ type: 'is-danger', message: error.message })
        }
        this.isLoading = false
      } else {
        this.addUnsavedChangesGuard(this.scenario)
        if (history.state.proposal) {
          this.scenario = Object.assign({}, this.scenario, history.state.proposal)
        }
      }
    },
    async saveScenario () {
      this.isLoading = true
      try {
        if (this.isNew) {
          this.scenario = await provider.createScenario(this.scenario)
          this.addUnsavedChangesGuard(this.scenario)
          this.$router.replace({ name: this.$route.name, params: { id: this.scenario.id } })
        } else {
          this.scenario = await provider.updateScenario(this.scenario)
          this.addUnsavedChangesGuard(this.scenario)
        }
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async removeScenario () {
      if (await this.confirmDelete('Le scénario sera supprimé.')) {
        this.isLoading = true
        try {
          await provider.deleteScenario(this.scenario.id)
          this.removeUnsavedChangesGuard()
          this.$router.back()
        } catch (error) {
          this.appStore.setInformation({ type: 'is-danger', message: error.message })
        }
        this.isLoading = false
      }
    },
    copyScenario () {
      const proposal = JSON.parse(JSON.stringify(this.scenario))
      delete proposal.id
      delete proposal.lastExecution
      proposal.name = `${proposal.name} (copie)`
      this.$router.push({
        name: 'admin-scenario',
        params: {
          id: 'new',
        },
        state: {
          proposal,
        },
      }).catch(() => {})
    },
    async testScenario () {
      this.isLoading = true
      try {
        await provider.changeScenarioState(this.scenario.id, 'run')
        this.appStore.setInformation({ type: 'is-success', message: 'Scénario exécuté avec succès' })
        this.getScenario()
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    addElement () {
      this.scenario.elements.push(this.createScenarioElement(this.elementType))
    },
    removeElement (index) {
      this.scenario.elements.splice(index, 1)
    },
    upElement (index) {
      this.scenario.elements.splice(index - 1, 0, this.scenario.elements.splice(index, 1)[0])
    },
    downElement (index) {
      this.scenario.elements.splice(index + 1, 0, this.scenario.elements.splice(index, 1)[0])
    },
    selectState (option) {
      if (option) {
        this.newTrigger.value = option.id
      }
    },
    addTrigger () {
      if (this.newTrigger.type === 'state' && this.newTrigger.value === null) {
        return
      }
      if (!this.scenario.triggers) {
        this.scenario.triggers = []
      }
      this.scenario.triggers.push({
        type: this.newTrigger.type,
        value: (this.newTrigger.type === 'state') ? this.newTrigger.value : this.newTrigger.dateValue,
      })
      this.newTrigger.value = null
    },
    removeTrigger (index) {
      this.scenario.triggers.splice(index, 1)
    },
    checkTriggerCronTime () {
      ({ result: this.newTrigger.cronResult, isValid: this.newTrigger.isCronValid } = this.checkCronTime(this.newTrigger.dateValue))
    },
  },
}
</script>
