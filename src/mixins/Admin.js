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
      'actions',
    ]),
    arrEquipments () { return Object.values(this.equipments) },
    arrStates () { return Object.values(this.states) },
    arrActions () { return Object.values(this.actions) },
    arrStatesWithEquipmentName () {
      return this.arrStates.map((state) => {
        const _state = {
          id: state.id,
          name: state.name,
          eqId: state.eqId,
          module: state.module,
          equipmentName: null,
        }
        if (_state.eqId) {
          const equipment = this.getEquipmentById(state.eqId)
          _state.equipmentName = equipment.name
        }
        return _state
      }).sort((a, b) => {
        if (a.equipmentName < b.equipmentName) { return -1 }
        if (a.equipmentName > b.equipmentName) { return 1 }
        if (a.name < b.name) { return -1 }
        if (a.name > b.name) { return 1 }
        return 0
      })
    },
  },
  methods: {
    getActionTypeClass (type) {
      switch (type) {
        case 'button':
          return 'far fa-square'
        case 'slider':
          return 'fa fa-arrows-alt-h'
        case 'select':
          return 'fa fa-list'
        case 'switch':
          return 'fa fa-toggle-off'
        case 'switch_on':
          return 'fa fa-toggle-on'
        case 'switch_off':
          return 'fa fa-toggle-off'
        default:
          return type
      }
    },
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
      'vxRefreshActions',
      'vxSaveAction',
      'vxDeleteAction',
    ]),
  },
}
