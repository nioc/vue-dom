import { createNamespacedHelpers } from 'vuex'
const { mapGetters } = createNamespacedHelpers('data')

export const SummaryMixin = {
  computed: {
    ...mapGetters(['getObjectSummaryById']),
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
  },
}
