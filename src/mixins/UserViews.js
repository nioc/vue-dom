import { createNamespacedHelpers } from 'vuex'
const { mapState, mapGetters, mapActions } = createNamespacedHelpers('data')

export const UserViewsMixin = {
  computed: {
    ...mapState(['userViews', 'userViewsList']),
    ...mapGetters([
      'getUserViewByCode',
    ]),
  },
  methods: {
    ...mapActions(['vxRefreshUserViews']),
  },
}
