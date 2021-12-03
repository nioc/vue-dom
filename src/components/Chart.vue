<template>
  <div>
    <canvas ref="canvas" :width="width" :height="height" />
  </div>
</template>

<script>
import { Chart, LineElement, PointElement, LineController, LinearScale, TimeScale, Tooltip, Filler, Legend, Decimation } from 'chart.js'
import 'chartjs-adapter-moment'

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
      default () {
        return {
          parsing: false,
          plugins: {
            legend: {
              display: false,
              position: 'bottom',
            },
            tooltip: {
              callbacks: this.tooltipCallbacks,
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
              time: {
                tooltipFormat: 'llll',
                displayFormats: {
                  second: 'LTS',
                  minute: 'LT',
                  hour: 'LT',
                  day: 'DD/MM',
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
    }
  },
  watch: {
    chartData: function () {
      this.render()
    },
  },
  mounted () {
    this.render()
  },
  beforeDestroy () {
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
        this.options.plugins.legend.display = true
        this.options.elements.line.fill = false
        delete this.options.scales.yLeft
        delete this.options.scales.yRight
        if (this.chartData.datasets.some((dataset) => dataset.yAxisID === 'yRight')) {
          this.options.scales.yLeft = {}
          this.options.scales.yRight = {
            type: 'linear',
            position: 'right',
            display: true,
          }
        }
      }
      this.chart = new Chart(ctx, {
        type: 'line',
        data: this.chartData,
        options: this.options,
      })
    },
  },
}
</script>
