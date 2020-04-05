import { mapState } from 'vuex'

export const ObjectsMixin = {
  computed: {
    ...mapState(['objects', 'objectsRaw']),
  },
  methods: {
  },
}
