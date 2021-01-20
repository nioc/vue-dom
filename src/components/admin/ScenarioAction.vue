<template>
  <div class="field is-horizontal">
    <div class="field-body">
      <div class="field is-required is-narrow">
        <options-autocomplete type="action" placeholder="Alerte" :value="scenarioAction.id" @select="selectAction" />
      </div>

      <div class="field has-addons">
        <div class="control">
          <div class="select" title="Type de paramètre">
            <select v-model="scenarioAction.paramsType">
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

      <div class="buttons">
        <button v-if="index>0" class="button is-light" title="Monter l'action" @click="$emit('up', index)">
          <span class="icon"><i class="fa fa-angle-double-up" /></span>
        </button>
        <button v-if="index<length-1" class="button is-light" title="Descendre l'action" @click="$emit('down', index)">
          <span class="icon"><i class="fa fa-angle-double-down" /></span>
        </button>
        <button class="button is-danger is-light" title="Supprimer l'action" @click="$emit('remove', index)">
          <span class="icon"><i class="fa fa-trash" /></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import OptionsAutocomplete from '@/components/admin/OptionsAutocomplete'
import { AdminMixin } from '@/mixins/Admin'

export default {
  name: 'ScenarioAction',
  components: {
    OptionsAutocomplete,
  },
  mixins: [
    AdminMixin,
  ],
  props: {
    scenarioAction: {
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
      paramsClass: '',
    }
  },
  computed: {
    params: {
      get: function () {
        switch (this.scenarioAction.paramsType) {
          case 'json':
            return (this.scenarioAction.params) ? JSON.stringify(this.scenarioAction.params, null, '\t') : ''
          default:
            return this.scenarioAction.params
        }
      },
      set: function (string) {
        this.paramsClass = ''
        switch (this.scenarioAction.paramsType) {
          case 'json':
            try {
              this.scenarioAction.params = JSON.parse(string)
            } catch (error) {
              this.paramsClass = 'is-danger'
            }
            break
          default:
            this.scenarioAction.params = string
            break
        }
      },
    },
    paramsPlaceholder () {
      switch (this.scenarioAction.paramsType) {
        case 'jsonata':
          return '{"json":"Etat 15 a pour valeur "&_15} ou \'Etat #15 = \'&_15'
        case 'json':
          return '{"attribut": "valeur", "isJson": true, "min": 0}'
        default:
          return 'valeur'
      }
    },
  },
  created () {
    if (!this.scenarioAction.paramsType) {
      this.scenarioAction.paramsType = 'string'
    }
  },
  methods: {
    selectAction (option) {
      if (option) {
        this.scenarioAction.id = option.id
      }
    },
  },
}
</script>
