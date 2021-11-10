import { createNamespacedHelpers } from 'vuex'
const { mapState, mapGetters, mapActions } = createNamespacedHelpers('data')

export const AdminMixin = {
  computed: {
    ...mapGetters([
      'getRoomById',
      'getEquipmentById',
      'getStateById',
      'getActionById',
    ]),
    ...mapState([
      'rooms',
      'equipments',
      'states',
      'actions',
      'channels',
      'tagsList',
    ]),
    arrEquipments () { return Object.values(this.equipments) },
    arrStates () { return Object.values(this.states) },
    arrActions () { return Object.values(this.actions) },
    arrChannels () { return Object.values(this.channels) },
    arrStatesWithEquipmentName () {
      return this.arrStates.map((state) => {
        const _state = {
          id: state.id,
          name: state.name,
          eqId: state.eqId,
          module: state.module,
          type: state.type,
          genericType: state.genericType,
          isVisible: state.isVisible,
          equipmentName: null,
          equipmentIsVisible: null,
          equipmentIsActive: null,
        }
        if (_state.eqId) {
          const equipment = this.getEquipmentById(state.eqId)
          _state.equipmentName = equipment.name
          _state.equipmentIsVisible = equipment.isVisible
          _state.equipmentIsActive = equipment.isActive
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
    arrActionsWithEquipmentName () {
      return this.arrActions.map((action) => {
        const _action = {
          id: action.id,
          name: action.name,
          eqId: action.eqId,
          module: action.module,
          isAsk: action.isAsk,
          isVisible: action.isVisible,
          stateFeedbackId: action.stateFeedbackId,
          equipmentName: null,
          equipmentIsVisible: null,
          equipmentIsActive: null,
        }
        if (_action.eqId) {
          const equipment = this.getEquipmentById(action.eqId)
          _action.equipmentName = equipment.name
          _action.equipmentIsVisible = equipment.isVisible
          _action.equipmentIsActive = equipment.isActive
        }
        return _action
      }).sort((a, b) => {
        if (a.equipmentName < b.equipmentName) { return -1 }
        if (a.equipmentName > b.equipmentName) { return 1 }
        if (a.name < b.name) { return -1 }
        if (a.name > b.name) { return 1 }
        return 0
      })
    },
    arrEquipmentsWithRoomName () {
      return this.arrEquipments.map((equipment) => {
        const _equipment = {
          id: equipment.id,
          name: equipment.name,
          module: equipment.module,
          isActive: equipment.isActive,
          isVisible: equipment.isVisible,
          roomId: equipment.roomId,
          roomName: null,
          roomIsVisible: null,
        }
        if (_equipment.roomId) {
          const room = this.getRoomById(equipment.roomId)
          _equipment.roomName = room.name
          _equipment.roomIsVisible = room.isVisible
        }
        return _equipment
      }).sort((a, b) => {
        if (a.roomName < b.roomName) { return -1 }
        if (a.roomName > b.roomName) { return 1 }
        if (a.name < b.name) { return -1 }
        if (a.name > b.name) { return 1 }
        return 0
      })
    },
  },
  methods: {
    getStateFullName (stateId) {
      let stateFullName = stateId
      const state = this.getStateById(stateId)
      if (state.name) {
        stateFullName = state.name
      }
      if (state.eqId) {
        const equipment = this.getEquipmentById(state.eqId)
        if (equipment.name) {
          stateFullName = `${equipment.name} > ${stateFullName}`
        }
      }
      return stateFullName
    },
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
      'vxRefreshChannels',
      'vxSaveChannel',
      'vxDeleteChannel',
      'vxRefreshUserViews',
      'vxSaveUserView',
      'vxDeleteUserView',
    ]),
  },
}
