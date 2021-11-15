<template>
  <div>
    <canvas ref="canvas" :width="width" :height="height" />
  </div>
</template>

<script>
import { Chart, LineElement, PointElement, LineController, LinearScale, TimeScale, Tooltip, Filler } from 'chart.js'
import 'chartjs-adapter-moment'

Chart.register(LineElement, PointElement, LineController, LinearScale, TimeScale, Tooltip, Filler)

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
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: this.tooltipCallbacks,
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
      this.chart = new Chart(ctx, {
        type: 'line',
        data: this.chartData,
        options: this.options,
      })
    },
  },
}
</script>
