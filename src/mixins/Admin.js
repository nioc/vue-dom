import { createNamespacedHelpers } from 'vuex'
const { mapState, mapGetters, mapActions } = createNamespacedHelpers('data')

export const AdminMixin = {
  computed: {
    ...mapGetters([
      'getRoomById',
      'getEquipmentById',
    ]),
    ...mapState([
      'rooms',
      'equipments',
      'states',
    ]),
    arrEquipments () { return Object.values(this.equipments) },
    arrStates () { return Object.values(this.states) },
  },
  methods: {
    ...mapActions([
      'vxRefreshRooms',
      'vxSaveRoom',
      'vxDeleteRoom',
      'vxRefreshEquipments',
      'vxSaveEquipment',
      'vxDeleteEquipment',
      'vxRefreshStates',
      'vxSaveState',
      'vxDeleteState',
    ]),
  },
}
