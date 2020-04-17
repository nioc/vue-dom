import { createNamespacedHelpers } from 'vuex'
const { mapState } = createNamespacedHelpers('data')

export const ObjectsMixin = {
  computed: {
    ...mapState(['objects', 'objectsRaw']),
  },
  methods: {
  },
}
