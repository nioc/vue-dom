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
          html += '<span><i class="fa-fw ' + this.summaryIconClass(info.key) + '"></i>' + info.value + this.summaryUnit(info.key) + '</span>'
        })
      }
      return html
    },
    summaryIconClass (key) {
      switch (key) {
        case 'humidity':
          return 'fa fa-tint'
        case 'temperature':
          return 'fa fa-thermometer-half'
        case 'light':
          return 'fa fa-lightbulb'
        case 'power':
          return 'fa fa-bolt'
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
