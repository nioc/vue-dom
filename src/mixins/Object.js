import { mapGetters, mapActions } from 'vuex'

export const ObjectMixin = {
  computed: {
    ...mapGetters(['getObjectById']),
  },
  methods: {
    ...mapActions(['loadObject']),
  },
}
