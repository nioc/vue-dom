import { createNamespacedHelpers } from 'vuex'
const { mapGetters, mapActions } = createNamespacedHelpers('objects')

export const ObjectMixin = {
  computed: {
    ...mapGetters(['getObjectById']),
  },
  methods: {
    ...mapActions(['loadObject']),
  },
}
