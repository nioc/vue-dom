import { createNamespacedHelpers } from 'vuex'
const { mapState, mapGetters, mapActions } = createNamespacedHelpers('data')

export const AdminMixin = {
  computed: {
    ...mapGetters([
      'getRoomById',
    ]),
    ...mapState([
      'rooms',
    ]),
  },
  methods: {
    ...mapActions([
      'vxRefreshRooms',
      'vxSaveRoom',
      'vxDeleteRoom',
    ]),
  },
}
