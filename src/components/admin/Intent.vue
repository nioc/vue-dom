<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-nlp'}, icon: 'fa-brain', text: 'Traitement automatique du langage naturel'}, {link: {}, icon: 'fa-comment-dots', text: `Intentions`, isActive: true}, {link: {name: 'admin-intent', params: {id}}, text: intent.key, isActive: true}]" />
    </div>

    <div class="hero-body px-3">
      <div class="container">
        <b-loading v-model="isLoading" :is-full-page="false" />
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
                <b-switch v-model="intent.isActive">{{ intent.isActive ? 'Actif' : 'Inactif' }}</b-switch>
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
          </section>
        </div>

        <b-collapse class="card mb-4" animation="slide" aria-id="relatedEntities" :open="false" @open="getRelatedEntities">
          <header slot="trigger" slot-scope="props" class="card-header" role="button" aria-controls="relatedEntities">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-cubes" /></span><span>Entités utilisées par cette intention</span>
            </p>
            <a class="card-header-icon">
              <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
            </a>
          </header>
          <section class="card-content">
            <table v-if="relatedEntities.length" class="table is-striped is-fullwidth is-vertical-centered">
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
            <span v-else>Aucune entité dans les énoncés de l'intention</span>
          </section>
        </b-collapse>

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-reply" /></span><span>Réponses à l'intention</span>
            </p>
          </header>
          <section class="card-content">
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
          </section>
        </div>

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-cogs" /></span><span>Traitements de l'intention</span>
            </p>
          </header>
          <section class="card-content">
            <table class="table is-striped is-fullwidth is-vertical-centered has-buttons">
              <thead>
                <tr>
                  <th class="is-required">Fonction</th>
                  <th>Paramètres(s)</th>
                  <th class="is-button" />
                </tr>
              </thead>
              <tbody>
                <tr v-for="(action, index) in intent.actions" :key="index">
                  <td>
                    <editable :value="action.key" type="select" :options="actionOptions" icon-class="fa fa-check" @update="(value) => action.key = value" />
                  </td>
                  <td>
                    <div v-for="(parameter, indexParameter) in action.parameters" :key="indexParameter">
                      <div>
                        <editable :value="parameter.value" tag="code" icon-class="fa fa-code" read-only-class="py-2" :placeholder="getIntentActionParameters(action.key, indexParameter)" :title="titleActionParameter" is-removable @remove="() => updateParameter(action, indexParameter, '')" @update="(value) => updateParameter(action, indexParameter, value)" />
                      </div>
                    </div>
                    <button class="button is-primary is-light" title="Ajouter un paramètre" @click="addParameter(action)">
                      <span class="icon"><i class="fa fa-plus-circle" /></span>
                    </button>
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
                          <select v-model="newAction.key">
                            <option v-for="option in actionOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td title="Les paramètres passés à la fonction dépendent ce celle-ci, ils peuvent indiquer le nom de l'entité à exploiter, la clé de résumé à lire, ...">
                    <div v-for="(parameter, index) in newAction.parameters" :key="index" class="field is-required">
                      <div class="control has-icons-left">
                        <input v-model="parameter.value" class="input" type="text" :placeholder="getIntentActionParameters(newAction.key, index)" @keyup.enter="addAction" @input="handleActionParameters(parameter.value, index)">
                        <span class="icon is-small is-left">
                          <i class="fa fa-code" />
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button type="submit" :disabled="newAction.key === ''" class="button is-primary is-light" title="Ajouter un traitement" @click="addAction">
                      <span class="icon"><i class="fa fa-plus-circle" /></span>
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </section>
        </div>

      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import Editable from '@/components/admin/Editable.vue'
import { UnsavedChangesGuardMixin } from '@/mixins/UnsavedChangesGuard'

export default {
  name: 'Intent',
  components: {
    Breadcrumb,
    Editable,
  },
  mixins: [
    UnsavedChangesGuardMixin,
  ],
  props: {
    id: {
      type: String,
      required: true,
    },
    proposal: {
      type: Object,
      required: false,
      default: () => {},
    },
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
      newAction: {
        key: '',
        parameters: [{ value: '' }],
      },
      actionOptions: [],
      isLoading: false,
    }
  },
  computed: {
    isNew () { return this.id === 'new' },
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
          this.intent = await this.$Provider.getIntent(this.id)
          this.addUnsavedChangesGuard('intent')
        } catch (error) {
          this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
        }
        this.isLoading = false
      } else {
        this.addUnsavedChangesGuard('intent')
        if (this.proposal) {
          this.intent = Object.assign({}, this.intent, this.proposal)
        }
      }
    },
    async saveIntent () {
      this.isLoading = true
      try {
        if (this.isNew) {
          this.intent = await this.$Provider.createIntent(this.intent)
          this.addUnsavedChangesGuard('intent')
          this.$router.replace({ name: this.$route.name, params: { id: this.intent.id } })
        } else {
          this.intent = await this.$Provider.updateIntent(this.intent)
          this.addUnsavedChangesGuard('intent')
        }
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async removeIntent () {
      this.$buefy.dialog.confirm({
        type: 'is-danger',
        title: 'Confirmation de suppression',
        message: '<p>L\'intention sera supprimée.</p><p>Souhaitez-vous continuer ?</p>',
        hasIcon: true,
        icon: 'trash',
        iconPack: 'fa',
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        onConfirm: async () => {
          this.isLoading = true
          try {
            await this.$Provider.deleteIntent(this.intent.id)
            this.removeUnsavedChangesGuard('intent')
            this.$router.back()
          } catch (error) {
            this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
          }
          this.isLoading = false
        },
      })
    },
    copyIntent () {
      const proposal = Object.assign({}, this.intent)
      delete proposal.id
      proposal.key = `${proposal.key}.copie`
      proposal.description = `${proposal.description} (copie)`
      this.$router.push({
        name: 'admin-intent',
        params: {
          id: 'new',
          proposal,
        },
      }).catch(() => {})
    },
    async getIntentActions () {
      this.actionOptions = await this.$Provider.getIntentActions()
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
        const entities = await this.$Provider.getEntities()
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
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
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
      if (this.newAction.key === '') {
        return
      }
      const action = Object.assign({}, this.newAction)
      action.parameters = action.parameters
        .filter((parameter) => parameter.value !== '')
      this.intent.actions.push(action)
      this.newAction = {
        key: '',
        parameters: [
          { value: '' },
        ],
      }
    },
    updateParameter (action, index, value) {
      if (value === undefined || value === '') {
        action.parameters.splice(index, 1)
        return
      }
      action.parameters[index].value = value
    },
    addParameter (action) {
      const value = this.getIntentActionParameters(action.key, action.parameters.length)
      action.parameters.push({ value })
    },
    handleActionParameters (parameter, index) {
      if (parameter !== '') {
        if (index === this.newAction.parameters.length - 1) {
          this.newAction.parameters.push({ value: '' })
        }
      } else {
        if (this.newAction.parameters[this.newAction.parameters.length - 1].value === '') {
          this.newAction.parameters.splice(index, 1)
        }
      }
    },
    getIntentActionParameters (action, index) {
      const actionOption = this.actionOptions.find((actionOption) => actionOption.value === action)
      if (!actionOption || !actionOption.parametersPlaceholder) {
        return '-- Paramètre non défini --'
      }
      if (!actionOption.parametersPlaceholder[index]) {
        return '-- Paramètre non défini pour cette action --'
      }
      return `Paramètre #${index + 1} : ${actionOption.parametersPlaceholder[index]}`
    },
  },
}
</script>
