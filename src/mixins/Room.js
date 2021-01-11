import { createNamespacedHelpers } from 'vuex'
const { mapGetters } = createNamespacedHelpers('data')

export const RoomMixin = {
  computed: {
    ...mapGetters([
      'getRoomById',
      'getRoomVisiblesEquipment',
    ]),
  },
}
