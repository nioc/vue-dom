import { createNamespacedHelpers } from 'vuex'
const { mapGetters } = createNamespacedHelpers('data')

export const SummaryMixin = {
  data () {
    return {
      summaryKeys: [
        {
          key: 'TEMPERATURE',
          label: 'Température',
        }, {
          key: 'LIGHT',
          label: 'Lumières',
        }, {
          key: 'HUMIDITY',
          label: 'Humidité',
        }, {
          key: 'POWER',
          label: 'Puissance',
        }, {
          key: 'DOWNLOAD',
          label: 'Download',
        }, {
          key: 'UPLOAD',
          label: 'Upload',
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['getRoomSummaryById']),
  },
  methods: {
    getSummaryIconClass (key) {
      switch (key) {
        case 'humidity':
          return 'fa fa-tint'
        case 'temperature':
          return 'fa fa-thermometer-half'
        case 'light':
          return 'fa fa-lightbulb'
        case 'power':
          return 'fa fa-bolt'
        case 'download':
          return 'fas fa-arrow-down'
        case 'upload':
          return 'fas fa-arrow-up'
      }
      return ''
    },
    getSummaryUnit (key) {
      switch (key) {
        case 'humidity':
          return '%'
        case 'temperature':
          return '°C'
        case 'light':
          return ''
        case 'power':
          return ' W'
        case 'upload':
        case 'download':
          return ' Ko/s'
      }
      return ''
    },
    getSummaryTypeLabel (key) {
      const summaryKey = this.summaryKeys.find((summaryKey) => summaryKey.key === key)
      return summaryKey ? summaryKey.label : key
    },
  },
}
