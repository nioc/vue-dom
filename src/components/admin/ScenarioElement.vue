<template>
  <div class="scenario-element is-flex">

    <b-switch v-model="element.isActive" size="is-small" title="Statut de l'élément" />

    <fieldset :disabled="!element.isActive">
      <scenario-rule
        v-if="element.type === 'rule'"
        :rule="element.definition"
        :index="index"
        :length="length"
        @up="$emit('up', index)"
        @down="$emit('down', index)"
        @remove="$emit('remove', index)"
      />
      <scenario-action
        v-else-if="element.type === 'action'"
        :scenario-action="element.definition"
        :index="index"
        :length="length"
        @remove="$emit('remove', index)"
        @up="$emit('up', index)"
        @down="$emit('down', index)"
      />
      <scenario-ask
        v-else-if="element.type === 'ask'"
        :scenario-ask="element.definition"
        :index="index"
        :length="length"
        @remove="$emit('remove', index)"
        @up="$emit('up', index)"
        @down="$emit('down', index)"
      />
    </fieldset>
  </div>
</template>

<script>
import ScenarioRule from '@/components/admin/ScenarioRule'
import ScenarioAction from '@/components/admin/ScenarioAction'
import ScenarioAsk from '@/components/admin/ScenarioAsk'

export default {
  name: 'ScenarioElement',
  components: {
    ScenarioRule,
    ScenarioAction,
    ScenarioAsk,
  },
  props: {
    element: {
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
  created () {
    if (!Object.prototype.hasOwnProperty.call(this.element, 'isActive')) {
      this.element.isActive = true
    }
  },
}
</script>
