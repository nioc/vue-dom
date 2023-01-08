<template>
  <div>
    <canvas ref="canvas" :width="width" :height="height" />
  </div>
</template>

<script>
import { Chart, LineElement, PointElement, LineController, LinearScale, TimeScale, Tooltip, Filler, Legend, Decimation } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { fr } from 'date-fns/locale'
import cloneDeep from 'lodash.clonedeep'

Chart.register(LineElement, PointElement, LineController, LinearScale, TimeScale, Tooltip, Filler, Legend, Decimation)

export default {
  name: 'Chart',
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    tooltipCallbacks: {
      type: Object,
      default () {
        return undefined
      },
    },
    options: {
      type: Object,
      required: false,
      default (props) {
        return {
          parsing: false,
          plugins: {
            legend: {
              display: false,
              position: 'bottom',
            },
            tooltip: {
              callbacks: props.tooltipCallbacks,
            },
            decimation: {
              enabled: true,
              algorithm: 'lttb',
              samples: 300,
              threshold: 300,
            },
          },
          maintainAspectRatio: false,
          spanGaps: false,
          elements: {
            line: {
              fill: true,
              tension: 0,
              backgroundColor: 'rgba(150, 201, 39, 0.5)',
              borderColor: 'rgb(150, 201, 39)',
            },
            point: {
              backgroundColor: 'rgba(150, 201, 39, 0.8)',
              radius: 2,
            },
          },
          scales: {
            x: {
              type: 'time',
              adapters: {
                date: {
                  locale: fr,
                },
              },
              time: {
                tooltipFormat: 'eee PPPpp',
                displayFormats: {
                  millisecond: 'pp SSS',
                  second: 'pp',
                  minute: 'p',
                  hour: 'p',
                  day: 'eee dd/LL',
                },
              },
            },
          },
        }
      },
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 400,
    },
  },
  data () {
    return {
      chart: null,
      localOptions: cloneDeep(this.options),
    }
  },
  watch: {
    chartData: function () {
      this.render()
    },
    tooltipCallbacks: function (val) {
      this.localOptions.plugins.tooltip.callbacks = val
    },
  },
  mounted () {
    this.render()
  },
  beforeUnmount () {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  methods: {
    render () {
      const ctx = this.$refs.canvas.getContext('2d')
      if (this.chart) {
        this.chart.destroy()
      }
      if (this.chartData.datasets.length > 1) {
        this.localOptions.plugins.legend.display = true
        this.localOptions.elements.line.fill = false
        delete this.localOptions.scales.yLeft
        delete this.localOptions.scales.yRight
        if (this.chartData.datasets.some((dataset) => dataset.yAxisID === 'yRight')) {
          this.localOptions.scales.yLeft = {}
          this.localOptions.scales.yRight = {
            type: 'linear',
            position: 'right',
            display: true,
          }
        }
      }
      this.chart = new Chart(ctx, {
        type: 'line',
        data: this.chartData,
        options: this.localOptions,
      })
    },
  },
}
</script>
