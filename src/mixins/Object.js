import { createNamespacedHelpers } from 'vuex'
const { mapGetters } = createNamespacedHelpers('data')

export const ObjectMixin = {
  computed: {
    ...mapGetters(['getObjectById']),
  },
}
