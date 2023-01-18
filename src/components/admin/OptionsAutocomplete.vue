<template>
  <o-autocomplete
    ref="autocomplete"
    v-model="searchInput"
    :data="filteredOptions"
    field="name"
    group-field="name"
    group-options="items"
    :placeholder="placeholder"
    :icon="icon"
    :title="titleComputed"
    open-on-focus
    keep-first
    :custom-class="autocompleteClass"
    :append-to-body="true"
    style="min-width: 150px;"
    @typing="autocompleteClass = 'is-danger'"
    @select="selectOption"
  >
    <template #default="props">
      <span v-if="type==='equipment'" :class="{'has-text-grey is-italic': !props.option.isVisible || !props.option.isActive || !props.option.roomIsVisible}">{{ props.option.name }}</span>
      <span v-else-if="type==='channel'" :class="{'has-text-grey is-italic': !props.option.isActive}">{{ props.option.name }}</span>
      <span v-else-if="type==='scenario'" :class="{'has-text-grey is-italic': !props.option.isActive}">{{ props.option.name }}</span>
      <span v-else :class="{'has-text-grey is-italic': !props.option.isVisible || !props.option.equipmentIsVisible || !props.option.equipmentIsActive}">{{ props.option.name }}</span>
    </template>
    <template #empty>Aucune correspondance</template>
  </o-autocomplete>
</template>

<script>
import { useDataStore } from '@/store/data'

export default {
  name: 'OptionsAutocomplete',
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
    title: {
      type: String,
      default: null,
    },
    filter: {
      type: Function,
      default() {
        return () => 1
      },
    },
    additionnalValue: {
      type: Object,
      default: null,
      validator: function (value) {
        return (value.id && value.name && value.group && value.type)
      },
    },
  },
  emits: [
    'select',
  ],
  setup() {
    const dataStore = useDataStore()
    return { dataStore }
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
        case 'equipment':
          return 'roomName'
        case 'scenario':
          return 'group'
        case 'channel':
          return null
        case 'state':
        case 'action':
        case 'ask':
        default:
          return 'equipmentName'
      }
    },
    titleComputed () {
      if (this.title) {
        return this.title
      }
      switch (this.type) {
        case 'action':
        case 'ask':
          return 'Action à utiliser'
        case 'equipment':
          return 'Équipement à utiliser'
        case 'channel':
          return 'Canal de communication à utiliser'
        case 'scenario':
          return 'Scénario à utiliser'
        case 'state':
        default:
          return 'Etat à utiliser'
      }
    },
    icon () {
      switch (this.type) {
        case 'equipment':
          return 'microchip'
        case 'action':
          return 'cogs'
        case 'channel':
        case 'ask':
          return 'comments'
        case 'scenario':
          return 'book'
        case 'state':
        default:
          return 'eye'
      }
    },
    options () {
      let options = []
      switch (this.type) {
        case 'state':
          options = this.dataStore.arrStatesWithEquipmentName
            .slice()
            .filter(this.filter)
            .map((option) => {
              return {
                ...option,
                name: `${option.equipmentName} > ${option.name}`,
              }
            })
          break
        case 'action':
          options = this.dataStore.arrActionsWithEquipmentName
            .slice()
            .filter(this.filter)
            .map((option) => {
              return {
                ...option,
                name: `${option.equipmentName} > ${option.name}`,
              }
            })
          break
        case 'ask':
          options = this.dataStore.arrActionsWithEquipmentName
            .slice()
            .filter((action) => action.isAsk)
            .filter(this.filter)
            .map((option) => {
              return {
                ...option,
                name: `${option.equipmentName} > ${option.name}`,
              }
            })
          break
        case 'channel':
          options = this.dataStore.arrChannels
            .slice()
            .filter(this.filter)
          break
        case 'equipment':
          options = this.dataStore.arrEquipmentsWithRoomName
            .slice()
            .filter(this.filter)
          break
        case 'scenario':
          options = this.dataStore.getScenarios()
            .slice()
            .filter(this.filter)
          break
        default:
          return []
      }
      if (this.additionnalValue) {
        options.unshift({
          id: this.additionnalValue.id,
          name: this.additionnalValue.name,
          type: this.additionnalValue.type,
          roomName: this.additionnalValue.group,
          equipmentName: this.additionnalValue.group,
          isVisible: true,
          equipmentIsVisible: true,
          equipmentIsActive: true,
          isActive: true,
          roomIsVisible: true,
        })
      }
      return options
    },
    filteredOptions () {
      // produce a group objects array ({name: '', items: []})
      return Object.entries(this.options
        .filter((option) => {
          if (!Object.prototype.hasOwnProperty.call(option, 'name') || !option.name) {
            return false
          }
          return option.name
            .toString()
            .toLowerCase()
            .indexOf(this.searchInput.toLowerCase()) >= 0
        })
        .reduce((result, item) => ({
          ...result,
          [this.groupField ? item[this.groupField] ? item[this.groupField] : 'Non classés' : '']: [
            ...(result[this.groupField ? item[this.groupField] ? item[this.groupField] : 'Non classés': ''] || []),
            item,
          ],
        }),
        [],
        ),
      )
        .map(group => {
          const groupObj = {
            name: group[0],
            items: group[1],
          }
          return groupObj
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
