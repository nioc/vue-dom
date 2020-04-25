import { createNamespacedHelpers } from 'vuex'
const { mapState, mapActions } = createNamespacedHelpers('data')

export const ObjectsMixin = {
  computed: {
    ...mapState(['objects', 'objectsRaw']),
  },
  methods: {
    ...mapActions(['loadObjects']),
  },
}
