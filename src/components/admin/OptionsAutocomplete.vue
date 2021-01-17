<template>
  <b-autocomplete
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
    search: {
      type: String,
      default: '',
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
    filteredOptions () {
      let collections = []
      switch (this.type) {
        case 'state':
          collections = this.arrStatesWithEquipmentName
          break
        case 'action':
          collections = this.arrActionsWithEquipmentName
          break
        case 'ask':
          collections = this.arrActionsWithEquipmentName.filter((action) => action.isAsk)
          break
        default:
          break
      }
      return collections.filter((option) => {
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
    search: {
      // reset input from parent
      immediate: true,
      handler (search) {
        this.searchInput = search
      },
    },
  },
  methods: {
    selectOption (option) {
      if (!option) {
        this.$emit('select', null)
        return
      }
      this.autocompleteClass = ''
      this.$emit('select', option)
    },
  },
}
</script>
