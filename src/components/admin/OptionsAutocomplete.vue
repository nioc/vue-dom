<template>
  <b-autocomplete
    ref="autocomplete"
    v-model="searchInput"
    :data="filteredOptions"
    field="name"
    :group-field="groupField"
    :placeholder="placeholder"
    :icon="icon"
    :title="title"
    open-on-focus
    keep-first
    :custom-class="autocompleteClass"
    :append-to-body="true"
    style="min-width: 150px;"
    @typing="autocompleteClass = 'is-danger'"
    @select="selectOption"
  >
    <template slot-scope="props">
      <span :class="{'has-text-grey is-italic': !props.option.isVisible || !props.option.equipmentIsVisible || !props.option.equipmentIsActive}">{{ props.option.name }}</span>
    </template>
    <template slot="empty">Aucune correspondance</template>
  </b-autocomplete>
</template>

<script>
import { AdminMixin } from '@/mixins/Admin'

export default {
  name: 'OptionsAutocomplete',
  mixins: [
    AdminMixin,
  ],
  props: {
    type: {
      type: String,
      default: 'state',
    },
    value: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: 'Etat',
    },
  },
  data () {
    return {
      searchInput: '',
      autocompleteClass: '',
    }
  },
  computed: {
    groupField () {
      switch (this.type) {
        case 'state':
        case 'action':
        case 'ask':
        default:
          return 'equipmentName'
      }
    },
    title () {
      switch (this.type) {
        case 'action':
        case 'ask':
          return 'Action à utiliser'
        case 'state':
        default:
          return 'Etat à utiliser'
      }
    },
    icon () {
      switch (this.type) {
        case 'action':
          return 'cogs'
        case 'ask':
          return 'comments'
        case 'state':
        default:
          return 'eye'
      }
    },
    options () {
      switch (this.type) {
        case 'state':
          return this.arrStatesWithEquipmentName
        case 'action':
          return this.arrActionsWithEquipmentName
        case 'ask':
          return this.arrActionsWithEquipmentName.filter((action) => action.isAsk)
        default:
          return []
      }
    },
    filteredOptions () {
      return this.options.filter((option) => {
        if (!Object.prototype.hasOwnProperty.call(option, 'name') || !option.name) {
          return false
        }
        return option.name
          .toString()
          .toLowerCase()
          .indexOf(this.searchInput.toLowerCase()) >= 0
      })
    },
  },
  watch: {
    value: {
      // reset input from parent
      handler (value) {
        if (this.value === null) {
          this.searchInput = ''
          this.autocompleteClass = ''
          return
        }
        this.setSelected(value)
      },
    },
  },
  mounted () {
    if (this.value !== null) {
      this.setSelected(this.value)
    }
  },
  methods: {
    selectOption (option) {
      if (!option) {
        // emit null value, allowing parent to clear its id
        this.$emit('select', null)
        return
      }
      this.autocompleteClass = ''
      this.$emit('select', option)
    },
    setSelected (value) {
      const selected = this.options.find((option) => option.id === value)
      if (selected === undefined) {
        this.autocompleteClass = 'is-danger'
        return
      }
      this.$refs.autocomplete.setSelected(selected)
      this.autocompleteClass = ''
    },
  },
}
</script>
