<template>
  <div class="field is-horizontal has-padding-left-6">
    <div class="field-body">
      <div class="field is-narrow">
        <options-autocomplete type="state" placeholder="Température" :search="fact.name" @select="selectState" />
      </div>

      <div class="field is-narrow">
        <div class="control">
          <div class="select">
            <select v-if="fact.type === 'numeric'" v-model="criteria.operator">
              <option value="e">&equals;</option>
              <option value="ne">&ne;</option>
              <option value="gt">&gt;</option>
              <option value="gte">&ge;</option>
              <option value="lt">&lt;</option>
              <option value="lte">&le;</option>
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
        <p class="control is-expanded">
          <input v-if="fact.type === 'numeric'" v-model.number="criteria.value" class="input" type="number" required>
          <input v-else v-model="criteria.value" class="input" type="text" required>
        </p>
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
import OptionsAutocomplete from '@/components/admin/OptionsAutocomplete'
import { AdminMixin } from '@/mixins/Admin'

export default {
  name: 'ScenarioCriteria',
  components: {
    OptionsAutocomplete,
  },
  mixins: [
    AdminMixin,
  ],
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
  data () {
    return {
      fact: {
        id: null,
        name: '',
        type: null,
      },
    }
  },
  watch: {
    'criteria.fact': {
      immediate: true,
      handler (id) {
        this.fact.id = id
        if (id && Object.prototype.hasOwnProperty.call(this.states, id)) {
          this.fact.name = this.states[this.fact.id].name
          this.fact.type = this.states[this.fact.id].type
        }
      },
    },
  },
  methods: {
    selectState (option) {
      if (!option) {
        if (this.criteria.fact) {
          this.fact.id = this.criteria.fact
          return
        }
        this.criteria.fact = null
        return
      }
      this.fact.id = option.id
      this.fact.name = option.name
      this.fact.type = option.type
      this.criteria.fact = option.id
    },
  },
}
</script>
