import { mapGetters } from 'vuex'

export const SummaryMixin = {
  computed: {
    ...mapGetters(['objectsSummaryById']),
  },
  methods: {
    getSummaryHtml (id) {
      const summary = this.objectsSummaryById(id)
      let html = ''
      if (summary.keys) {
        summary.keys.forEach((info) => {
          html += '<span><i class="fa fa-fw ' + this.summaryIconClass(info.key) + '"></i>' + info.value + this.summaryUnit(info.key) + '</span>'
        })
      }
      return html
    },
    summaryIconClass (key) {
      switch (key) {
        case 'humidity':
          return 'fa-tint'
        case 'temperature':
          return 'fa-thermometer-half'
        case 'light':
          return 'fa-lightbulb-o'
        case 'power':
          return 'fa-flash'
      }
      return ''
    },
    summaryUnit (key) {
      switch (key) {
        case 'humidity':
          return '%'
        case 'temperature':
          return '°C'
        case 'light':
          return ''
        case 'power':
          return ' W'
      }
      return ''
    },
  },
}
