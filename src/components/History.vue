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
    series: {
      type: Array,
      default: undefined,
    },
  },
  data () {
    return {
      startDate: null,
      endDate: null,
      duration: 'PT24H',
      history: {
        datasets: [],
      },
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
      if (this.duration !== null) {
        this.startDate = this.$moment().subtract(this.$moment.duration(this.duration)).toDate()
        this.endDate = this.$moment().toDate()
      }
      if (this.series === undefined || this.series.length === 0 || this.series[0].id === undefined) {
        console.error('History called without series')
        return
      }
      const datasets = []
      await Promise.all(this.series.map(async (serie) => {
        const history = await this.$Provider.getHistory(serie.id, this.startDate, this.endDate)
        let format = (point) => {
          return {
            x: point.date,
            y: point.value,
          }
        }
        switch (serie.dataType) {
          case 'boolean': {
            this.tooltipCallbacks = {
              label: (context) => `${serie.name}: ${context.raw.y ? 'Actif' : 'Inactif'}`,
            }
            break
          }
          case 'duration': {
            format = (point) => {
              return {
                x: point.date,
                y: this.$moment.duration(point.value).as('minutes'),
              }
            }
            this.tooltipCallbacks = {
              label: (context) => `${serie.name}: ${this.$moment.duration(context.raw.y, 'minutes').humanize()}`,
            }
            break
          }
        }
        datasets.push({
          label: serie.name,
          data: history.map(format),
          stepped: serie.dataType === 'boolean',
          backgroundColor: serie.backgroundColor,
          borderColor: serie.borderColor,
          yAxisID: serie.yAxisID || 'yLeft',
        })
      }))
      this.history = {
        datasets,
      }
      this.loaded = true
    },
    updateDates () {
      if (this.duration !== null) {
        this.getHistory()
      }
    },
  },
}
</script>
