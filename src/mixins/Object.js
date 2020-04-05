import { mapGetters, mapActions } from 'vuex'

export const ObjectMixin = {
  computed: {
    ...mapGetters(['objectById']),
  },
  methods: {
    ...mapActions(['loadObject']),
  },
}
