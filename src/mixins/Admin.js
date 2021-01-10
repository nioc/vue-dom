import { createNamespacedHelpers } from 'vuex'
const { mapState, mapGetters, mapActions } = createNamespacedHelpers('data')

export const AdminMixin = {
  computed: {
    ...mapGetters([
      'getRoomById',
    ]),
    ...mapState([
      'rooms',
      'equipments',
    ]),
    arrEquipments () { return Object.values(this.equipments) },
  },
  methods: {
    ...mapActions([
      'vxRefreshRooms',
      'vxSaveRoom',
      'vxDeleteRoom',
      'vxRefreshEquipments',
      'vxSaveEquipment',
      'vxDeleteEquipment',
    ]),
  },
}
