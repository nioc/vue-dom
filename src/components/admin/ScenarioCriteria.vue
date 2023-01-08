<template>
  <div class="field is-horizontal pl-4">
    <div class="field-body">
      <div class="field is-narrow">
        <options-autocomplete type="state" placeholder="Température" :value="criteria.fact" :additionnal-value="{id: 'answer', name: 'Réponse utilisateur', group: 'Demande du scénario', type: 'string'}" @select="selectState" />
      </div>

      <div class="field is-narrow">
        <div class="control">
          <div class="select">
            <select v-if="factType === 'numeric' || factType === 'duration'" v-model="criteria.operator">
              <option value="e">&equals;</option>
              <option value="ne">&ne;</option>
              <option value="gt">&gt;</option>
              <option value="gte">&ge;</option>
              <option value="lt">&lt;</option>
              <option value="lte">&le;</option>
            </select>
            <select v-else-if="factType === 'boolean'" v-model="booleanValue">
              <option :value="true">est actif (vrai)</option>
              <option :value="false">est inactif (faux)</option>
            </select>
            <select v-else v-model="criteria.operator">
              <option value="e">&equals;</option>
              <option value="ne">&ne;</option>
              <option value="like">Contient</option>
            </select>
          </div>
        </div>
      </div>

      <div class="field">
        <div v-if="factType !== 'boolean'" class="field has-addons">
          <div class="control is-expanded">
            <input v-if="factType === 'numeric'" v-model.number="criteria.value" class="input" type="number" :placeholder="criteria.value === null ? 'null' : ''" required>
            <input v-else v-model="criteria.value" class="input" type="text" :placeholder="criteria.value === null ? 'null' : ''" required>
          </div>
          <div v-if="criteria.value !== null" class="control">
            <button class="button" style="height: 40px;width: 40px;" title="Valoriser la valeur à null" @click="criteria.value = null"><i class="fas fa-eraser" /></button>
          </div>
        </div>
      </div>

      <div class="buttons">
        <button v-if="index>0" class="button is-light" title="Monter la condition" @click="$emit('up', index)">
          <span class="icon"><i class="fa fa-angle-double-up" /></span>
        </button>
        <button v-if="index<length-1" class="button is-light" title="Descendre la condition" @click="$emit('down', index)">
          <span class="icon"><i class="fa fa-angle-double-down" /></span>
        </button>
        <button class="button is-danger is-light" title="Supprimer la condition" @click="$emit('remove', index)">
          <span class="icon"><i class="fa fa-trash" /></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import OptionsAutocomplete from '@/components/admin/OptionsAutocomplete.vue'

export default {
  name: 'ScenarioCriteria',
  components: {
    OptionsAutocomplete,
  },
  props: {
    criteria: {
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
  emits: [
    'up',
    'remove',
    'down',
  ],
  data () {
    return {
      factType: null,
    }
  },
  computed: {
    booleanValue: {
      get: function () {
        if (this.factType !== 'boolean') {
          return undefined
        }
        return this.criteria.operator === 'e' && this.criteria.value === true
      },
      set: function (value) {
        this.criteria.operator = 'e'
        this.criteria.value = value
      },
    },
  },
  methods: {
    selectState (option) {
      if (option) {
        if (option.type === 'boolean' && this.criteria.fact !== option.id) {
          this.criteria.value = true
        }
        this.criteria.fact = option.id
        this.factType = option.type
      }
    },
  },
}
</script>
