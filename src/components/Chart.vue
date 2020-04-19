<script>
import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      required: false,
      default () {
        return {
          legend: {
            display: false,
          },
          maintainAspectRatio: false,
          spanGaps: false,
          elements: {
            line: {
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
            xAxes: [{
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
            }],
          },
        }
      },
    },
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  },
}
</script>
