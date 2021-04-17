<template>
  <div class="scenario-ask has-padding-left-6 has-margin-vertical-7">
    <div class="field is-horizontal">
      <div class="field-body">

        <div class="field is-required is-narrow">
          <options-autocomplete type="channel" placeholder="XMPP" :value="scenarioAsk.id" @select="selectChannel" />
        </div>

        <div class="field has-addons">
          <div class="control">
            <div class="select" title="Type de paramètre">
              <select v-model="scenarioAsk.paramsType">
                <option value="json">JSON</option>
                <option value="jsonata">JSONata</option>
                <option value="string">String</option>
              </select>
            </div>
          </div>
          <div class="control is-expanded">
            <input v-model.lazy="params" class="input is-family-code" :class="paramsClass" :placeholder="paramsPlaceholder" title="Paramètre de l'action">
          </div>
        </div>

        <div class="field is-narrow">
          <p class="control has-icons-left">
            <input v-model.number="scenarioAsk.timeout" class="input" type="number" required placeholder="Timeout en secondes" title="Timeout en secondes">
            <span class="icon is-small is-left">
              <i class="fas fa-clock" />
            </span>
          </p>
        </div>

        <div class="buttons">
          <button v-if="index>0" class="button is-light" title="Monter la demande" @click="$emit('up', index)">
            <span class="icon"><i class="fa fa-angle-double-up" /></span>
          </button>
          <button v-if="index<length-1" class="button is-light" title="Descendre la demande" @click="$emit('down', index)">
            <span class="icon"><i class="fa fa-angle-double-down" /></span>
          </button>
          <button class="button is-danger is-light" title="Supprimer la demande" @click="$emit('remove', index)">
            <span class="icon"><i class="fa fa-trash" /></span>
          </button>
        </div>

      </div>
    </div>

    <div class="field is-horizontal">
      <span class="tag is-light is-info is-large has-margin-right-7"><span class="is-size-6">Lors de la réponse</span></span>
      <button class="button is-primary is-light" title="Ajouter une règle" @click="addOnElement(scenarioAsk.onValidElements, 'rule')">
        <span class="icon"><i class="fa fa-plus-circle" /></span>
        <span>Règle</span>
      </button>
    </div>
    <scenario-element v-for="(element, elementIndex) in scenarioAsk.onValidElements" :key="'v'+elementIndex" :element="element" :index="elementIndex" :length="scenarioAsk.onValidElements.length" class="has-padding-left-6" @remove="(index) => removeOnElement(scenarioAsk.onValidElements, index)" />

    <div class="field is-horizontal">
      <span class="tag is-light is-info is-large has-margin-right-7"><span class="is-size-6">Sans réponse</span></span>
      <button class="button is-primary is-light" title="Ajouter une action" @click="addOnElement(scenarioAsk.onTimeoutElements, 'action')">
        <span class="icon"><i class="fa fa-plus-circle" /></span>
        <span>Action</span>
      </button>
    </div>
    <scenario-element v-for="(element, elementIndex) in scenarioAsk.onTimeoutElements" :key="'i'+elementIndex" :element="element" :index="elementIndex" :length="scenarioAsk.onTimeoutElements.length" class="has-padding-left-6" @remove="(index) => removeOnElement(scenarioAsk.onTimeoutElements, index)" />

  </div>
</template>

<script>
import OptionsAutocomplete from '@/components/admin/OptionsAutocomplete'
import { AdminMixin } from '@/mixins/Admin'
import { AdminScenarioMixin } from '@/mixins/AdminScenario'

export default {
  name: 'ScenarioAsk',
  components: {
    OptionsAutocomplete,
    ScenarioElement: () => import('@/components/admin/ScenarioElement'),
  },
  mixins: [
    AdminMixin,
    AdminScenarioMixin,
  ],
  props: {
    scenarioAsk: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    length: {
      type: Number,
      required: true,
    },
  },
  data () {
    return {
      isLoading: false,
      paramsClass: '',
    }
  },
  computed: {
    params: {
      get: function () {
        switch (this.scenarioAsk.paramsType) {
          case 'json':
            return (this.scenarioAsk.params) ? JSON.stringify(this.scenarioAsk.params, null, '\t') : ''
          default:
            return this.scenarioAsk.params
        }
      },
      set: function (string) {
        this.paramsClass = ''
        switch (this.scenarioAsk.paramsType) {
          case 'json':
            try {
              this.scenarioAsk.params = JSON.parse(string)
            } catch (error) {
              this.paramsClass = 'is-danger'
            }
            break
          default:
            this.scenarioAsk.params = string
            break
        }
      },
    },
    paramsPlaceholder () {
      switch (this.scenarioAsk.paramsType) {
        case 'jsonata':
          return '{"json":"Etat 15 a pour valeur "&_15} ou \'Etat #15 = \'&_15'
        case 'json':
          return '{"attribut": "Text de la demande", "isJson": true, "min": 0}'
        default:
          return 'Texte de la demande'
      }
    },
  },
  created () {
    if (!this.scenarioAsk.paramsType) {
      this.scenarioAsk.paramsType = 'string'
    }
  },
  methods: {
    selectChannel (option) {
      if (option) {
        if (this.scenarioAsk.onValidElements.length === 0) {
          // create default rule
          const answerRule = this.createScenarioElement('rule')
          this.scenarioAsk.onValidElements.push(answerRule)
        }
        if (this.scenarioAsk.onValidElements.length === 1 && this.scenarioAsk.onValidElements[0].definition.criterias.length === 0) {
          // create default criteria with "answer" state of the channel
          const answerCriteria = this.createScenarioElement('criteria')
          answerCriteria.fact = this.channels[option.id].input
          this.scenarioAsk.onValidElements[0].definition.criterias.push(answerCriteria)
        }
        this.scenarioAsk.id = option.id
      }
    },
    addOnElement (collection, type = 'action') {
      if (!collection) {
        collection = []
      }
      collection.push(this.createScenarioElement(type))
    },
    removeOnElement (collection, index) {
      collection.splice(index, 1)
    },
  },
}
</script>
