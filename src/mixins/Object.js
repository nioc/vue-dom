import { createNamespacedHelpers } from 'vuex'
const { mapGetters, mapActions } = createNamespacedHelpers('data')

export const ObjectMixin = {
  computed: {
    ...mapGetters(['getObjectById']),
  },
  methods: {
    ...mapActions(['loadObject']),
  },
}
