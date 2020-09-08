import { createNamespacedHelpers } from 'vuex'
const { mapGetters } = createNamespacedHelpers('data')

export const AdminMixin = {
  computed: {
    ...mapGetters(['getRoomById']),
  },
}
