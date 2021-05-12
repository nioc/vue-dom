<template>
  <div v-if="isEdited" class="field is-required">
    <div v-if="type==='input'" class="control" :class="{'has-icons-left': iconClass, 'has-icons-right': isRemovable}">
      <input ref="field" v-model.lazy="editedValue" class="input" :class="{'is-danger': isInvalid}" type="text" :placeholder="placeholder" @blur="leaveEdit" @keyup.enter="leaveEdit" @focus="isInvalid = false">
      <span v-if="iconClass" class="icon is-small is-left">
        <i :class="iconClass" />
      </span>
      <span v-if="isRemovable" class="icon is-small is-right is-clickable">
        <i class="fa fa-trash has-text-danger" title="Effacer" @mousedown="$emit('remove')" />
      </span>
    </div>
    <div v-if="type==='select'" class="field is-narrow">
      <div class="control">
        <div class="select">
          <select ref="field" v-model="editedValue" @change="leaveEdit" @blur="leaveEdit">
            <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="tag==='code'" style="cursor: pointer;" :class="readOnlyClass" @click="enterEdit"><code>{{ readOnlyValue }}</code></div>
  <component :is="tag" v-else style="cursor: pointer;" :class="readOnlyClass" @click="enterEdit">{{ readOnlyValue }}</component>
</template>

<script>

export default {
  name: 'Editable',
  props: {
    type: {
      type: String,
      default: 'input',
    },
    value: {
      type: String,
      default: null,
    },
    isRemovable: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: null,
    },
    tag: {
      type: String,
      default: 'div',
    },
    readOnlyClass: {
      type: String,
      default: null,
    },
    iconClass: {
      type: String,
      default: null,
    },
    isEmptiable: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      isEdited: false,
      isInvalid: false,
    }
  },
  computed: {
    editedValue: {
      get: function () { return this.value },
      set: function (value) { this.$emit('update', value) },
    },
    readOnlyValue () {
      switch (this.type) {
        case 'select': {
          const option = this.options.find((option) => option.value === this.value)
          return option ? option.label : this.value
        }
        default:
          return this.value
      }
    },
  },
  methods: {
    enterEdit () {
      this.isEdited = true
      this.$nextTick(() => {
        const field = this.$refs.field
        if (field) {
          field.focus()
        }
      })
    },
    leaveEdit () {
      if (!this.isEmptiable && this.editedValue === '') {
        this.isInvalid = true
        return
      }
      this.isEdited = false
    },
  },
}
</script>
