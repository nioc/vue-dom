<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-nlp'}, icon: 'fa-brain', text: 'Traitement automatique du langage naturel'}, {link: {}, icon: 'fa-comment-dots', text: `Intentions`, isActive: true}, {link: {name: 'admin-intent', params: {id}}, text: intent.key, isActive: true}]" />
    </div>

    <div class="hero-body px-3">
      <div class="container">
        <o-loading v-model:active="isLoading" :full-page="false" />
        <div class="card mb-4">

          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-comment-dots" /></span><span>Informations de l'intention</span>
            </p>
          </header>

          <section class="card-content">
            <div class="field is-required">
              <label class="label">Clé</label>
              <div class="control has-icons-left">
                <input v-model="intent.key" class="input" type="text" placeholder="Clé de l'intention : greetings.hello">
                <span class="icon is-small is-left">
                  <i class="fas fa-tag" />
                </span>
              </div>
            </div>

            <div class="field is-required">
              <label class="label">Description</label>
              <div class="control has-icons-left">
                <input v-model="intent.description" class="input" type="text" placeholder="Description de l'intention">
                <span class="icon is-small is-left">
                  <i class="fas fa-info" />
                </span>
              </div>
            </div>

            <div class="field">
              <div class="control">
                <label class="label">Statut</label>
                <o-switch v-model="intent.isActive">{{ intent.isActive ? 'Actif' : 'Inactif' }}</o-switch>
              </div>
            </div>

            <div class="buttons">
              <button class="button is-primary" title="Sauvegarder l'intention" @click="saveIntent">
                <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Rafraichir l'intention" @click="getIntent">
                <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Dupliquer l'intention" @click="copyIntent">
                <span class="icon"><i class="fa fa-copy" /></span><span>Dupliquer</span>
              </button>
              <button v-if="!isNew" class="button is-danger" title="Supprimer l'intention" @click="removeIntent">
                <span class="icon"><i class="fa fa-trash" /></span><span>Supprimer</span>
              </button>

            </div>
          </section>
        </div>

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-comment-dots" /></span><span>Enoncés de l'intention</span>
            </p>
          </header>
          <section class="card-content">
            <div class="table-container">
              <table class="table is-striped is-fullwidth is-vertical-centered has-buttons">
                <thead>
                  <tr>
                    <th class="is-required">Énoncé</th>
                    <th class="is-button" />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(utterance, index) in intent.utterances" :key="index">
                    <td>
                      <editable :value="utterance.value" icon-class="far fa-comment-dots" :placeholder="placeholderUtterance" :title="titleUtterance" :is-emptiable="false" @update="(value) => utterance.value = value" />
                    </td>
                    <td>
                      <button class="button is-danger is-light" title="Supprimer l'énoncé" @click="removeUtterance(index)">
                        <span class="icon"><i class="fa fa-trash" /></span>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="field is-required">
                        <div class="control has-icons-left">
                          <input v-model="newUtterance.value" class="input" type="text" :placeholder="placeholderUtterance" :title="titleUtterance" @keyup.enter="addUtterance">
                          <span class="icon is-small is-left">
                            <i class="far fa-comment-dots" />
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button :disabled="newUtterance.value === ''" class="button is-primary is-light" title="Ajouter un énoncé" @click="addUtterance">
                        <span class="icon"><i class="fa fa-plus-circle" /></span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <o-collapse class="card mb-4" animation="slide" aria-id="relatedEntities" :open="false" @open="getRelatedEntities">
          <template #trigger="props">
            <header class="card-header" role="button" aria-controls="relatedEntities">
              <p class="card-header-title">
                <span class="icon"><i class="fa fa-cubes" /></span><span>Entités utilisées par cette intention</span>
              </p>
              <a class="card-header-icon">
                <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
              </a>
            </header>
          </template>
          <section class="card-content">
            <div v-if="relatedEntities.length" class="table-container">
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
                  <tr v-for="(entity, index) in relatedEntities" :key="index">
                    <td>
                      <router-link v-if="entity.id" :to="{name: 'admin-entity', params: {id: entity.id}}">{{ entity.key }}</router-link>
                      <span v-else class="has-text-danger">{{ entity.key }}</span>
                    </td>
                    <td>{{ entity.description }}</td>
                    <td class="has-text-centered"><i class="fas fa-fw" :class="entity.isActive ? 'fa-toggle-on has-text-success' : 'fa-toggle-off has-text-grey'" :title="entity.isActive ? 'Actif' : 'Inactif'" /></td>
                    <td class="has-text-centered">{{ entity.options ? entity.options.length : '' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <span v-else>Aucune entité dans les énoncés de l'intention</span>
          </section>
        </o-collapse>

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-reply" /></span><span>Réponses à l'intention</span>
            </p>
          </header>
          <section class="card-content">
            <div class="table-container">
              <table class="table is-striped is-fullwidth is-vertical-centered has-buttons">
                <thead>
                  <tr>
                    <th class="is-required">Template</th>
                    <th>Condition(s)</th>
                    <th class="is-button" />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(answer, index) in intent.answers" :key="index">
                    <td>
                      <editable :value="answer.template" icon-class="fa fa-reply" :placeholder="placeholderAnswerTemplate" :title="titleAnswerTemplate" :is-emptiable="false" @update="(value) => answer.template = value" />
                    </td>
                    <td>
                      <editable :value="answer.opts" tag="code" icon-class="fa fa-check" :placeholder="placeholderAnswerOpts" :title="titleAnswerOpts" @update="(value) => answer.opts = value" />
                    </td>
                    <td>
                      <button class="button is-danger is-light" title="Supprimer la réponse" @click="removeAnswer(index)">
                        <span class="icon"><i class="fa fa-trash" /></span>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div class="field is-required">
                        <div class="control has-icons-left">
                          <input v-model="newAnswer.template" class="input" type="text" :placeholder="'Il fait {{value}}°C dans {{room}}'" title="Les templates de réponse peuvent inclure des entités ou les mots clés &quot;value&quot; et &quot;unit&quot; encadrés par des doubles accolades qui seront fusionnés lors de la réponse" @keyup.enter="addAnswer">
                          <span class="icon is-small is-left">
                            <i class="fa fa-reply" />
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="field is-required">
                        <div class="control has-icons-left">
                          <input v-model="newAnswer.opts" class="input" type="text" placeholder="room !== undefined &amp;&amp; room !== 'Salon'" title="Les conditions permettent de filtrer les réponses proposées" @keyup.enter="addAnswer">
                          <span class="icon is-small is-left">
                            <i class="fa fa-check" />
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button :disabled="newAnswer.template === ''" class="button is-primary is-light" title="Ajouter une réponse" @click="addAnswer">
                        <span class="icon"><i class="fa fa-plus-circle" /></span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-cogs" /></span><span>Traitements de l'intention</span>
            </p>
          </header>
          <section class="card-content">
            <div class="table-container">
              <table class="table is-striped is-fullwidth is-vertical-centered has-buttons">
                <thead>
                  <tr>
                    <th class="is-required">Fonction</th>
                    <th>Paramètres(s)</th>
                    <th class="is-button" />
                    <th class="is-button" />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(action, index) in intent.actions" :key="index">
                    <td>
                      <editable :value="action.key" type="select" :options="selectActionOptions" icon-class="fa fa-check" @update="(value) => updateActionKey(action, value)" />
                    </td>
                    <td>
                      <div v-for="(parameter, indexParameter) in action.parameters" :key="indexParameter">
                        <div>
                          <options-autocomplete v-if="actionOptions[action.key].parameters[indexParameter].inputType === 'OptionsAutocomplete'" :placeholder="actionOptions[action.key].parameters[indexParameter].placeholder" :type="actionOptions[action.key].parameters[indexParameter].type" :value="parameter.value" @select="(selected) => parameter.value = selected ? selected.id : null" />
                          <editable v-else :value="parameter.value" tag="code" icon-class="fa fa-code" read-only-class="py-2" :placeholder="actionOptions[action.key].parameters[indexParameter].placeholder" :title="actionOptions[action.key].parameters[indexParameter].placeholder" @update="(value) => parameter.value = value" />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="buttons">
                        <button v-if="index>0" class="button is-light" title="Monter le traitement" @click="up(index)">
                          <span class="icon"><i class="fa fa-angle-double-up" /></span>
                        </button>
                        <button v-if="index<intent.actions.length-1" class="button is-light" title="Descendre le traitement" @click="down(index)">
                          <span class="icon"><i class="fa fa-angle-double-down" /></span>
                        </button>
                      </div>
                    </td>
                    <td>
                      <button class="button is-danger is-light" title="Supprimer le traitement" @click="removeAction(index)">
                        <span class="icon"><i class="fa fa-trash" /></span>
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div class="field is-narrow">
                        <div class="control">
                          <div class="select">
                            <select v-model="newActionKey">
                              <option v-for="(option, value) in actionOptions" :key="value" :value="value">{{ option.label }}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div v-if="newActionKey">
                        <div v-for="(parameter, index) in actionOptions[newActionKey].parameters" :key="index" class="field is-required">
                          <options-autocomplete v-if="parameter.inputType === 'OptionsAutocomplete'" :placeholder="parameter.placeholder" :type="parameter.type" :value="parameter.value" @select="(selected) => parameter.value = selected ? selected.id : null" />
                          <div v-else class="control has-icons-left">
                            <input v-model="parameter.value" class="input" type="text" :placeholder="parameter.placeholder" @keyup.enter="addAction">
                            <span class="icon is-small is-left">
                              <i class="fa fa-code" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td />
                    <td>
                      <button type="submit" :disabled="newActionKey === ''" class="button is-primary is-light" title="Ajouter un traitement" @click="addAction">
                        <span class="icon"><i class="fa fa-plus-circle" /></span>
                      </button>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </section>
        </div>

      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
import Editable from '@/components/admin/Editable.vue'
import OptionsAutocomplete from '@/components/admin/OptionsAutocomplete.vue'
import { useAppStore } from '@/store/app'
import { useDataStore } from '@/store/data'
import { useDialog } from '@/composables/useDialog'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { provider } from '@/services/Provider'

export default {
  name: 'Intent',
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
    const { addUnsavedChangesGuard, removeUnsavedChangesGuard } = useUnsavedChangesGuard()
    const { confirmDelete } = useDialog()
    return { appStore, dataStore, addUnsavedChangesGuard, removeUnsavedChangesGuard, confirmDelete }
  },
  data () {
    return {
      intent: {
        utterances: [],
        answers: [],
        actions: [],
      },
      placeholderUtterance: 'Quelle est la température dans %room% ?',
      titleUtterance: "Les énoncés sont les phrases de l'utilisateur associées à l'intention, ils peuvent inclure des entités encadrées par des %",
      placeholderAnswerTemplate: "'Il fait {{value}}°C dans {{room}}'",
      titleAnswerTemplate: 'Les templates de réponse peuvent inclure des entités ou les mots clés "value" et "unit" encadrés par des doubles accolades qui seront fusionnés lors de la réponse',
      placeholderAnswerOpts: "room !== undefined && room !== 'Salon'",
      titleAnswerOpts: 'Les conditions permettent de filtrer les réponses proposées',
      placeholderActionParameter: 'temperature',
      titleActionParameter: "Les paramètres passés à la fonction dépendent ce celle-ci, ils peuvent indiquer le nom de l'entité à exploiter, la clé de résumé à lire, ...",
      newUtterance: {
        value: '',
      },
      relatedEntities: [],
      newAnswer: {
        template: '',
        opts: '',
      },
      newActionKey: '',
      actionOptions: [],
      isLoading: false,
    }
  },
  computed: {
    isNew () {
      return this.id === 'new'
    },
    selectActionOptions () {
      return Object.entries(this.actionOptions)
        .map(option => {
          return {
            value: option[0],
            label: option[1].label,
          }
        })
    },
  },
  mounted () {
    this.getIntent()
    this.getIntentActions()
  },
  methods: {
    async getIntent () {
      if (!this.isNew) {
        this.isLoading = true
        try {
          this.intent = await provider.getIntent(this.id)
          this.addUnsavedChangesGuard(this.intent)
          this.intent.actions.forEach(this.setActionParameters)
        } catch (error) {
          this.appStore.setInformation({ type: 'is-danger', message: error.message })
        }
        this.isLoading = false
      } else {
        this.addUnsavedChangesGuard(this.intent)
        if (history.state.proposal) {
          this.intent = Object.assign({}, this.intent, history.state.proposal)
        }
      }
    },
    async saveIntent () {
      this.isLoading = true
      try {
        if (this.isNew) {
          this.intent = await provider.createIntent(this.intent)
          this.addUnsavedChangesGuard(this.intent)
          this.$router.replace({ name: this.$route.name, params: { id: this.intent.id } })
        } else {
          this.intent = await provider.updateIntent(this.intent)
          this.addUnsavedChangesGuard(this.intent)
        }
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async removeIntent () {
      if (await this.confirmDelete('L\'intention sera supprimée.')) {
        this.isLoading = true
        try {
          await provider.deleteIntent(this.intent.id)
          this.removeUnsavedChangesGuard()
          this.$router.back()
        } catch (error) {
          this.appStore.setInformation({ type: 'is-danger', message: error.message })
        }
        this.isLoading = false
      }
    },
    copyIntent () {
      const proposal = JSON.parse(JSON.stringify(this.intent))
      delete proposal.id
      proposal.key = `${proposal.key}.copie`
      proposal.description = `${proposal.description} (copie)`
      this.$router.push({
        name: 'admin-intent',
        params: {
          id: 'new',
        },
        state: {
          proposal,
        },
      }).catch(() => {})
    },
    async getIntentActions () {
      this.actionOptions = await provider.getIntentActions()
    },
    removeUtterance (index) {
      this.intent.utterances.splice(index, 1)
    },
    addUtterance () {
      if (this.newUtterance.value === '') {
        return
      }
      this.intent.utterances.push(Object.assign({}, this.newUtterance))
      this.newUtterance = {
        value: '',
      }
    },
    async getRelatedEntities () {
      this.isLoading = true
      try {
        // get entities
        const entities = await provider.getEntities()
        // get entered entities in utterances (inside %)
        const enteredEntities = {}
        this.intent.utterances
          .forEach((utterance) => {
            utterance.value.replace(/%([^% ]+)%/g, (match, captured) => {
              enteredEntities[captured] = captured
            })
          })
        // link entered and existing entities
        this.relatedEntities = Object.keys(enteredEntities)
          .map((enteredEntity) => {
            const entity = entities.find((entity) => entity.key === enteredEntity)
            if (entity) {
              return entity
            }
            return {
              key: enteredEntity,
            }
          })
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    removeAnswer (index) {
      this.intent.answers.splice(index, 1)
    },
    addAnswer () {
      if (this.newAnswer.template === '') {
        return
      }
      this.intent.answers.push(Object.assign({}, this.newAnswer))
      this.newAnswer = {
        template: '',
        opts: '',
      }
    },
    removeAction (index) {
      this.intent.actions.splice(index, 1)
    },
    addAction () {
      if (this.newActionKey === '') {
        return
      }
      this.intent.actions.push({
        key: this.newActionKey,
        parameters: this.actionOptions[this.newActionKey].parameters.map(parameter => ({ value: parameter.value }))
          .filter((parameter) => parameter.value !== ''),
      })
      this.newActionKey = ''
    },
    up (index) {
      this.intent.actions.splice(index - 1, 0, this.intent.actions.splice(index, 1)[0])
    },
    down (index) {
      this.intent.actions.splice(index + 1, 0, this.intent.actions.splice(index, 1)[0])
    },
    updateActionKey (action, key) {
      action.key = key
      this.setActionParameters(action)
    },
    setActionParameters (action) {
      const delta = this.actionOptions[action.key].parameters.length - action.parameters.length
      if (delta !== 0) {
        if (delta > 0) {
          for(let i=0; i < delta; i++) {
            action.parameters.push({ value: '' })
          }
        } else {
          action.parameters.splice(delta)
        }
      }
    },
  },
}
</script>
