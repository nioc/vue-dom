import { createNamespacedHelpers } from 'vuex'
const { mapState } = createNamespacedHelpers('objects')

export const ObjectsMixin = {
  computed: {
    ...mapState(['objects', 'objectsRaw']),
  },
  methods: {
  },
}
