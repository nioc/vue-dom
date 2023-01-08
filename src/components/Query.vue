<template>
  <div class="is-auto-expand" :class="{'is-expanded': isExpanded}">
    <o-autocomplete
      id="question"
      v-model="question"
      :data="filteredSentences"
      placeholder="Quelle est la température ?"
      icon="comments"
      title="Poser une question"
      :readonly="isLoading"
      :disabled="isLoading"
      :loading="isLoading"
      @focus="isExpanded = true"
      @select="(option) => ask(option)"
      @keyup.enter="ask()"
      @keyup.esc="clear()"
    >
      <template #empty>Aucune correspondance</template>
    </o-autocomplete>
    <button v-if="isExpanded && !isLoading" class="delete is-medium" title="Fermer" @click="clear()" />
    <o-icon v-if="isExpanded && isLoading" class="is-loading" icon="circle-notch" :spin="true" size="medium" />
  </div>
</template>

<script>
import { useAppStore } from '@/store/app'
import { provider } from '@/services/Provider'

export default {
  name: 'Query',
  setup() {
    const appStore = useAppStore()
    return { appStore }
  },
  data () {
    return {
      question: '',
      sentences: [],
      isExpanded: false,
      isLoading: false,
    }
  },
  computed: {
    filteredSentences () {
      return this.sentences.filter((sentence) => {
        return sentence.indexOf(this.question.toLowerCase()) > -1
      })
    },
  },
  mounted () {
    this.getSentences()
  },
  methods: {
    clear () {
      document.getElementById('question').blur()
      this.question = ''
      this.isExpanded = false
    },
    async ask (question) {
      if (this.isLoading) {
        return
      }
      if (question) {
        this.question = question
      }
      if (this.question === '') {
        // no question asked, do not call API
        this.clear()
        return
      }
      this.isLoading = true
      try {
        const message = await provider.askQuestion(this.question)
        this.clear()
        this.appStore.setInformation({ type: 'is-dark', message, position: 'bottom', duration: 5000 })
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async getSentences () {
      try {
        this.sentences = await provider.getSentences()
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
    },
  },
}
</script>
