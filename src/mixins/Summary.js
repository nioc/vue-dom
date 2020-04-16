import { createNamespacedHelpers } from 'vuex'
const { mapGetters } = createNamespacedHelpers('objects')

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
      }
      return ''
    },
  },
}
