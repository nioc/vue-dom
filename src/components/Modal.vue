<template>
  <div class="modal-card animation-content">
    <header class="modal-card-head has-text-weight-semibold">
      <p class="modal-card-title">{{ title }}</p>
    </header>
    <section class="modal-card-body">
      <div class="media">
        <div v-if="hasIcon" class="media-left">
          <span class="icon is-large" :class="iconType">
            <i :class="iconClass" class="fa-2x" />
          </span>
        </div>
        <div class="media-content">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="message" />
          <div v-if="prompt" class="field pt-4">
            <div class="control">
              <input ref="promptInput" v-model="promptValue" :type="prompt.type" :placeholder="prompt.placeholder" required="required" autofocus class="input" :class="{'is-danger': error}">
            </div>
            <p v-if="error" class="help is-danger">{{ error }}</p>
          </div>
        </div>
      </div>
    </section>
    <footer class="modal-card-foot">
      <button v-if="hasCancelButton" type="button" class="button" @click="validate(false)">
        <span>{{ cancelText }}</span>
      </button>
      <button type="button" class="button" :class="type" @click="validate(true)">
        <span>{{ confirmText }}</span>
      </button>
    </footer>
  </div>
</template>

<script>
import { nextTick } from 'vue'
export default {
  name: 'Modal',
  props: {
    type: {
      type: String,
      default: 'is-primary',
    },
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    prompt: {
      type: Object,
      default: null,
    },
    hasIcon: {
      type: Boolean,
      default: false,
    },
    hasCancelButton: {
      type: Boolean,
      default: false,
    },
    iconClass: {
      type: String,
      default: '',
    },
    confirmText: {
      type: String,
      default: 'OK',
    },
    cancelText: {
      type: String,
      default: 'Cancel',
    },
  },
  emits: [
    'close',
    'promptAnswered',
  ],
  data () {
    return {
      error: null,
      promptValue: this.prompt ? this.prompt.value : null,
    }
  },
  computed: {
    iconType: function () {
      switch (this.type) {
        case 'is-danger':
          return 'has-text-danger'
        case 'is-primary':
        default:
          return 'has-text-primary'
      }
    },
  },
  mounted () {
    if (this.prompt) {
      nextTick(() => {
        this.$refs.promptInput.focus()
      })
    }
  },
  methods: {
    validate(isAccepted) {
      if (this.prompt) {
        if (!this.validPrompt()) {
          return
        }
        this.$emit('promptAnswered', this.promptValue)
      }
      this.$emit('close', { action: isAccepted ? 'ok' : 'cancel' })
    },
    validPrompt() {
      this.error = null
      if (!this.promptValue) {
        this.error = 'This field is required.'
        return false
      }
      return true
    },
  },
}
</script>