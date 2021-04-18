<template>
  <div class="scenario-rule pl-4 my-3">
    <div class="field is-horizontal">
      <div class="field-body">

        <div class="field is-narrow"><span class="tag is-light is-large is-info"><span class="is-size-6">Si</span></span></div>

        <div class="field is-narrow">
          <div class="control">
            <div class="select">
              <select v-model="rule.type">
                <option value="any">Au moins une condition</option>
                <option value="all">Toutes les conditions</option>
              </select>
            </div>
          </div>
        </div>

        <div class="field is-narrow">
          <b-checkbox-button v-model="rule.skipRepeated" :native-value="true" class="is-success is-light" type="is-danger is-light">
            <span v-if="rule.skipRepeated" class="icon is-small is-left m-0" title="Ignorer si l'évaluation de la règle est inchangée">
              <i class="fas fa-ban" />
            </span>
            <span v-else class="icon is-small is-left m-0" title="À chaque fois">
              <i class="fas fa-redo" />
            </span>
          </b-checkbox-button>
        </div>

        <div class="field is-grouped">
          <div v-if="hasSub || rule.criterias.length === 0" class="control">
            <button class="button is-primary is-light" title="Ajouter une règle" @click="addRule">
              <span class="icon"><i class="fa fa-plus-circle" /></span>
              <span>Règle</span>
            </button>
          </div>
          <div v-if="!hasSub" class="control">
            <button class="button is-primary is-light" title="Ajouter une condition" @click="addCriteria">
              <span class="icon"><i class="fa fa-plus-circle" /></span>
              <span>Condition</span>
            </button>
          </div>
        </div>

        <div class="buttons">
          <button v-if="index>0" class="button is-light" title="Monter la règle" @click="$emit('up', index)">
            <span class="icon"><i class="fa fa-angle-double-up" /></span>
          </button>
          <button v-if="index<length-1" class="button is-light" title="Descendre la règle" @click="$emit('down', index)">
            <span class="icon"><i class="fa fa-angle-double-down" /></span>
          </button>
          <button class="button is-danger is-light" title="Supprimer la règle" @click="$emit('remove', index)">
            <span class="icon"><i class="fa fa-trash" /></span>
          </button>
        </div>

      </div>
    </div>

    <div v-if="hasSub">
      <scenario-rule v-for="(nestedRule, nestedIndex) in rule.criterias" :key="'r'+nestedIndex" :rule="nestedRule" :index="nestedIndex" :length="rule.criterias.length" @remove="(index) => remove(rule.criterias, index)" @up="(index) => up(rule.criterias, index)" @down="(index) => down(rule.criterias, index)" />
    </div>

    <scenario-criteria v-for="(criteria, criteriaIndex) in rule.criterias" v-else :key="'c'+criteriaIndex" :criteria="criteria" :index="criteriaIndex" :length="rule.criterias.length" class="field is-horizontal" @remove="(index) => remove(rule.criterias, index)" @up="(index) => up(rule.criterias, index)" @down="(index) => down(rule.criterias, index)" />

    <div class="field is-horizontal">
      <span class="tag is-light is-info is-large mr-3"><span class="is-size-6">Alors</span></span>
      <button class="button is-primary is-light" title="Ajouter une action" @click="addOnElement(rule.onValidElements, 'action')">
        <span class="icon"><i class="fa fa-plus-circle" /></span>
        <span>Action</span>
      </button>
    </div>
    <scenario-element v-for="(element, elementIndex) in rule.onValidElements" :key="'v'+elementIndex" :element="element" :index="elementIndex" :length="rule.onValidElements.length" class="pl-4" @remove="(index) => remove(rule.onValidElements, index)" @up="(index) => up(rule.onValidElements, index)" @down="(index) => down(rule.onValidElements, index)" />

    <div class="field is-horizontal">
      <span class="tag is-light is-info is-large mr-3"><span class="is-size-6">Sinon</span></span>
      <button class="button is-primary is-light" title="Ajouter une action" @click="addOnElement(rule.onInvalidElements, 'action')">
        <span class="icon"><i class="fa fa-plus-circle" /></span>
        <span>Action</span>
      </button>
    </div>
    <scenario-element v-for="(element, elementIndex) in rule.onInvalidElements" :key="'i'+elementIndex" :element="element" :index="elementIndex" :length="rule.onInvalidElements.length" class="pl-4" @remove="(index) => remove(rule.onInvalidElements, index)" @up="(index) => up(rule.onInvalidElements, index)" @down="(index) => down(rule.onInvalidElements, index)" />

  </div>
</template>

<script>
import ScenarioCriteria from '@/components/admin/ScenarioCriteria'
import { AdminScenarioMixin } from '@/mixins/AdminScenario'

export default {
  name: 'ScenarioRule',
  components: {
    ScenarioCriteria,
    ScenarioElement: () => import('@/components/admin/ScenarioElement'),
  },
  mixins: [
    AdminScenarioMixin,
  ],
  props: {
    rule: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: false,
      default: 0,
    },
    length: {
      type: Number,
      required: true,
    },
  },
  computed: {
    hasSub () { return (this.rule.criterias.some((rule) => (rule.criterias))) },
  },
  methods: {
    addRule () {
      this.rule.criterias.push({ type: 'any', criterias: [], onValidElements: [], onInvalidElements: [] })
    },
    addCriteria () {
      this.rule.criterias.push(this.createScenarioElement('criteria'))
    },
    addOnElement (collection, type = 'action') {
      if (!collection) {
        collection = []
      }
      collection.push(this.createScenarioElement(type))
    },
    up (collection, index) {
      collection.splice(index - 1, 0, collection.splice(index, 1)[0])
    },
    down (collection, index) {
      collection.splice(index + 1, 0, collection.splice(index, 1)[0])
    },
    remove (collection, index) {
      collection.splice(index, 1)
    },
  },
}
</script>
