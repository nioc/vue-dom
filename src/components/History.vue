<template>
  <div>
    <div class="field is-horizontal">
      <div class="field-body">
        <div class="field is-narrow" title="Durée d'historique">
          <div class="control has-icons-left">
            <div class="select is-small">
              <select v-model="duration" @change="updateDates">
                <option value="PT1H">1 heure</option>
                <option value="PT6H">6 heures</option>
                <option value="PT24H">24 heures</option>
                <option value="P7D">7 jours</option>
                <option value="P30D">30 jours</option>
                <option :value="null">Personnalisé</option>
              </select>
              <div class="icon is-small is-left">
                <i class="fas fa-history" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="duration === null" class="field" title="Date de début">
          <b-datetimepicker v-model="startDate" :max-datetime="today" size="is-small" />
        </div>
        <div v-if="duration === null" class="field" title="Date de fin">
          <b-datetimepicker v-model="endDate" :max-datetime="today" size="is-small" />
        </div>
        <div class="field">
          <button class="button is-primary is-rounded is-small" @click="getHistory"><span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span></button>
        </div>
      </div>
    </div>
    <chart v-if="loaded" :chart-data="history" :tooltip-callbacks="tooltipCallbacks" />
  </div>
</template>

<script>
import Chart from '@/components/Chart'
export default {
  components: {
    Chart,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    hasSteps: {
      type: Boolean,
      default: false,
    },
    dataType: {
      type: String,
      default: null,
    },
  },
  data () {
    return {
      startDate: null,
      endDate: null,
      duration: 'PT24H',
      history: null,
      loaded: false,
      tooltipCallbacks: undefined,
    }
  },
  computed: {
    today () { return new Date() },
  },
  created () {
    this.endDate = new Date()
    this.startDate = new Date(this.endDate.getTime() - 86400000)
    this.getHistory()
  },
  methods: {
    async getHistory () {
      const history = await this.$Provider.getHistory(this.id, this.startDate, this.endDate)
      let format = (point) => point.value
      switch (this.dataType) {
        case 'boolean': {
          this.tooltipCallbacks = {
            label: (context) => `${this.name}: ${context.raw ? 'Actif' : 'Inactif'}`,
          }
          break
        }
        case 'duration': {
          format = (point) => this.$moment.duration(point.value).as('minutes')
          this.tooltipCallbacks = {
            label: (context) => `${this.name}: ${this.$moment.duration(context.raw, 'minutes').humanize()}`,
          }
          break
        }
      }
      this.history = {
        datasets: [
          {
            label: this.name,
            data: history.map(format),
            steppedLine: this.hasSteps,
          },
        ],
        labels: history.map((point) => point.date),
      }
      this.loaded = true
    },
    updateDates () {
      if (this.duration !== null) {
        this.startDate = this.$moment().subtract(this.$moment.duration(this.duration)).toDate()
        this.getHistory()
      }
    },
  },
}
</script>
