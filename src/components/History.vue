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
                <option value="">Personnalisé</option>
              </select>
              <div class="icon is-small is-left">
                <i class="fas fa-history" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="duration === ''" class="field" title="Date de début">
          <o-datetimepicker v-model="startDate" :max-datetime="today" size="small" />
        </div>
        <div v-if="duration === ''" class="field" title="Date de fin">
          <o-datetimepicker v-model="endDate" :max-datetime="today" size="small" />
        </div>
        <div class="field">
          <button class="button is-primary is-rounded is-small" :class="{'is-loading': isLoading}" :disabled="isLoading" @click="getHistory"><span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span></button>
        </div>
      </div>
    </div>
    <chart v-if="isLoaded" :chart-data="history" :tooltip-callbacks="tooltipCallbacks" @time-changed="updateDates" />
  </div>
</template>

<script>
import Chart from '@/components/Chart.vue'
import { useAppStore } from '@/store/app'
import { dtSub, durParse, durToMinutes, dtFormatDuration } from '@/services/Datetime'
import { provider } from '@/services/Provider'

export default {
  name: 'History',
  components: {
    Chart,
  },
  props: {
    series: {
      type: Array,
      default: undefined,
    },
  },
  setup() {
    const appStore = useAppStore()
    return { appStore }
  },
  data () {
    return {
      startDate: null,
      endDate: null,
      duration: 'PT24H',
      history: {
        datasets: [],
      },
      isLoaded: false,
      isLoading: false,
      tooltipCallbacks: undefined,
    }
  },
  computed: {
    today () {
      return new Date()
    },
  },
  created () {
    this.endDate = new Date()
    this.startDate = new Date(this.endDate.getTime() - 86400000)
    this.getHistory()
  },
  methods: {
    async getHistory () {
      if (this.duration !== '') {
        const now = new Date()
        this.startDate = dtSub(now, durParse(this.duration))
        this.endDate = now
      }
      if (this.series === undefined || this.series.length === 0 || this.series[0].id === undefined) {
        console.error('History called without series')
        return
      }
      const datasets = []
      this.isLoading = true
      try {
        await Promise.all(this.series.map(async (serie) => {
          const history = await provider.getHistory(serie.id, this.startDate, this.endDate)
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
                  y: durToMinutes(point.value),
                  label: dtFormatDuration(durParse(point.value)),
                }
              }
              this.tooltipCallbacks = {
                label: (context) => `${serie.name}: ${context.raw.label}`,
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
        this.isLoaded = true
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    updateDates ({ min, max }) {
      if (min && max) {
        // use new range received from chart
        this.duration = ''
        this.startDate = new Date(Math.floor(min))
        this.endDate = new Date(Math.ceil(max))
        this.getHistory()
        return
      }
      if (this.duration !== '') {
        this.getHistory()
      }
    },
  },
}
</script>
