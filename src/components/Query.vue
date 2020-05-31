<template>
  <div class="is-auto-expand" :class="{'is-expanded': isExpanded}">
    <b-autocomplete
      id="question"
      v-model="question"
      :data="filteredSentences"
      placeholder="Quelle est la température ?"
      icon="comments"
      title="Poser une question"
      @focus="isExpanded = true"
      @select="(option) => ask(option)"
      @keyup.enter.native="ask()"
      @keyup.esc.native="clear()"
    >
      <template slot="empty">Aucune correspondance</template>
    </b-autocomplete>
    <button v-if="isExpanded" class="delete is-medium" title="Fermer" @click="clear()" />
  </div>
</template>

<script>

export default {
  name: 'Query',
  data () {
    return {
      question: '',
      sentences: [],
      isExpanded: false,
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
    clear (isClearingQuestion) {
      document.getElementById('question').blur()
      this.question = ''
      this.isExpanded = false
    },
    async ask (question) {
      if (question) {
        this.question = question
      }
      if (this.question === '') {
        // no question asked, do not call API
        this.clear()
        return
      }
      try {
        const message = await this.$Provider.askQuestion(this.question)
        this.clear()
        this.$store.commit('app/setInformation', { type: 'is-dark', message, position: 'is-bottom', duration: 5000 })
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
    },
    async getSentences () {
      try {
        this.sentences = await this.$Provider.getSentences()
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
    },
  },
}
</script>
