<template>
  <section class="card-content">
    <b-loading v-model="isLoading" :is-full-page="false" />
    <span class="buttons pt-3">
      <button class="button is-primary" title="Lancer l'apprentissage du corpus" @click="train">
        <span class="icon"><i class="fa fa-brain" /></span><span>Entraîner</span>
      </button>
    </span>

    <div class="field is-required">
      <label class="label">Énoncé de test</label>
      <div class="field has-addons">
        <div class="control has-icons-left is-expanded">
          <input v-model="test.utterance" class="input" type="text" placeholder="Message test" @keyup.enter="checkUtterance">
          <span class="icon is-small is-left">
            <i class="fas fa fa-comment-dots" />
          </span>
        </div>
        <div class="control">
          <button class="button is-primary" title="Tester l'énoncé" :disabled="test.utterance.length === 0" @click="checkUtterance">
            <span class="icon"><i class="fa fa-comments" /></span><span>Tester</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="test.result !== null">
      <div class="field">
        <label class="label">Réponse</label>
        <div class="control has-icons-left">
          <textarea v-model="formattedAnswer" class="textarea" readonly disabled />
          <span class="icon is-small is-left">
            <i class="fas fa fa-reply" />
          </span>
        </div>
      </div>

      <div class="field">
        <label class="label">Durée du traitement</label>
        <div class="control has-icons-left">
          <input v-model="duration" class="input" readonly disabled>
          <span class="icon is-small is-left">
            <i class="fas fa fa-clock" />
          </span>
        </div>
      </div>

      <div v-if="test.result.classifications" class="field">
        <label class="label">Intentions</label>
        <div class="control has-icons-left">
          <div class="table-container">
            <table class="table is-fullwidth is-striped is-vertical-centered is-bordered">
              <thead>
                <tr>
                  <th>Choix</th>
                  <th>Clé</th>
                  <th class="has-text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="intent in test.result.classifications" :key="intent.intent">
                  <td><i class="far fa-fw" :class="intent.intent === test.result.intent ? 'fa-check-square has-text-success' : 'fa-square has-text-grey-light'" /></td>
                  <td>{{ intent.intent }}</td>
                  <td class="has-text-right">{{ Math.round(intent.score * 100) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="test.result.answers" class="field">
        <label class="label">Templates de réponse possibles</label>
        <div class="control has-icons-left">
          <div class="table-container">
            <table class="table is-fullwidth is-striped is-vertical-centered is-bordered">
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Condition(s)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="answer in test.result.answers" :key="answer.answer">
                  <td class="is-family-code">{{ answer.answer }}</td>
                  <td><span v-if="answer.opts" class="is-family-code">{{ answer.opts }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="test.result.entities" class="field">
        <label class="label">Entités identifiées</label>
        <div class="control has-icons-left">
          <div v-if="test.result.entities.length" class="table-container">
            <table class="table is-fullwidth is-striped is-vertical-centered is-bordered">
              <thead>
                <tr>
                  <th>Clé</th>
                  <th class="has-text-right">Précision</th>
                  <th>Type</th>
                  <th>Option</th>
                  <th>Extraction</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entity, index) in test.result.entities" :key="index">
                  <td>{{ entity.entity }}</td>
                  <td class="has-text-right">{{ Math.round(entity.accuracy * 100) }}%</td>
                  <td>{{ entity.type }}</td>
                  <td>{{ entity.option }}</td>
                  <td>{{ entity.utteranceText }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <span v-else>Aucune entité identifiée</span>
        </div>
      </div>

      <div v-if="test.result.actions" class="field">
        <label class="label">Traitements réalisés</label>
        <div class="control has-icons-left">
          <div v-if="test.result.actions.length" class="table-container">
            <table class="table is-fullwidth is-striped is-vertical-centered is-bordered">
              <thead>
                <tr>
                  <th>Fonction</th>
                  <th>Paramètres</th>
                  <th class="has-text-centered">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(action, index) in test.result.actions" :key="index">
                  <td>{{ getActionLabel(action.action) }}</td>
                  <td class="is-family-code mr-3">{{ action.parameters.join(', ') }}</td>
                  <td class="has-text-centered" :title="action.msg"><i class="fas fa-fw" :class="action.isSuccessful ? 'fa-check has-text-success' : 'fa-times has-text-danger'" /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <span v-else>Aucun traitement réalisé</span>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
export default {
  name: 'NlpEngine',
  data () {
    return {
      test: {
        utterance: '',
        result: null,
      },
      actionOptions: [],
      isLoading: false,
    }
  },
  computed: {
    duration () { return `${this.test.result.duration} ms` },
    formattedAnswer () { return this.test.result.answer.replace(/(\\+n)+/g, '\r\n') },
  },
  mounted () {
    this.getIntentActions()
  },
  methods: {
    async train () {
      this.isLoading = true
      try {
        await this.$Provider.trainNlp()
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async checkUtterance () {
      if (this.test.utterance === '') {
        return
      }
      this.isLoading = true
      try {
        this.test.result = await this.$Provider.processNlp(this.test.utterance)
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async getIntentActions () {
      this.actionOptions = await this.$Provider.getIntentActions()
    },
    getActionLabel (optionValue) {
      const option = this.actionOptions.find((option) => option.value === optionValue)
      return option ? option.label : optionValue
    },
  },
}
</script>
