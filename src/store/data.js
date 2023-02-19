import { defineStore } from 'pinia'
import { normalize, schema } from 'normalizr'
import { useAppStore } from '@/store/app'
import { dtFormat } from '@/services/Datetime'
import { provider } from '@/services/Provider'

const custom = window.custom

// prepare data normalization schemas
const stateSchema = new schema.Entity('states')
const actionSchema = new schema.Entity('actions')
const equipmentSchema = new schema.Entity('equipments', {
  states: [stateSchema],
  actions: [actionSchema],
})
const roomSchema = new schema.Entity('rooms', {
  equipments: [equipmentSchema],
})
const roomListSchema = new schema.Array(roomSchema)
const scenarioSchema = new schema.Entity('scenarios')
const scenarioListSchema = new schema.Array(scenarioSchema)

const getDefaultState = () => ({
  rooms: {},
  roomsSummary: {},
  roomsRaw: [],
  equipments: {},
  states: {},
  actions: {},
  summaryList: [],
  statesStatistics: {},
  tagsList: [],
  scenarios: {},
  channels: {},
  notifications: [],
  userViews: {},
  userViewsList: [],
})

export const useDataStore = defineStore('data', {

  state: () => getDefaultState(),

  getters: {
    // return room by id or object with empty name and equipments
    getRoomById: (state) => (id) => {
      return (state.rooms[id]) || {
        name: '',
        equipments: [],
      }
    },

    // return room summary by id or empty object
    getRoomSummaryById: (state) => (id) => {
      return (state.roomsSummary[id]) || {}
    },

    // return equipment by id or object with empty action and state
    getEquipmentById: (state) => (id) => {
      return (state.equipments[id]) || {
        states: [],
        actions: [],
      }
    },

    // return equipments ids by tag
    getEquipmentsIdByTag: (state) => (tag) => {
      return Object.values(state.equipments).filter((equipment) => equipment.tags.includes(tag)).map((equipment) => equipment.id)
    },

    // return all states for requested equipment id
    getStatesByEquipmentId: (state) => (id) => {
      const states = []
      const statesId = state.equipments[id].states
      // reduce state to minimal informations
      statesId.forEach((stateId) => {
        const c = state.getStateById(stateId)
        states.push({
          id: c.id,
          type: c.type,
          genericType: c.genericType,
          isVisible: c.isVisible,
        })
      })
      return states
    },

    // return all actions for requested equipment id
    getActionsByEquipmentId: (state) => (id) => {
      const actions = []
      const actionsId = state.equipments[id].actions
      // reduce action to minimal informations
      actionsId.forEach((actionId) => {
        const c = state.getActionById(actionId)
        actions.push({
          id: c.id,
          name: c.name,
          type: c.type,
          stateFeedbackId: c.stateFeedbackId,
          isVisible: c.isVisible,
          options: c.options,
          needsConfirm: c.needsConfirm,
        })
      })
      return actions
    },

    // return states by id or empty array
    getStatesByIds: (state) => (statesId) => {
      const states = []
      statesId.forEach((stateId) => {
        const c = state.getStateById(stateId)
        states.push({
          id: c.id,
          type: c.type,
          genericType: c.genericType,
          isVisible: c.isVisible,
        })
      })
      return states
    },

    // return actions by id or empty array
    getActionsByIds: (state) => (actionsId) => {
      const actions = []
      actionsId.forEach((actionId) => {
        const c = state.getActionById(actionId)
        actions.push({
          id: c.id,
          type: c.type,
          stateFeedbackId: c.stateFeedbackId,
          isVisible: c.isVisible,
        })
      })
      return actions
    },

    // return state by id or empty object
    getStateById: (state) => (id) => {
      return (state.states[id]) || { }
    },
    // return action by id or empty object
    getActionById: (state) => (id) => {
      return (state.actions[id]) || { }
    },
    // return scenario by id or empty object
    getScenarioById: (state) => (id) => {
      return (state.scenarios[id]) || { }
    },

    // return state statistics by id or null
    getStateStatisticsById: (state) => (id) => {
      return (state.statesStatistics[id]) || null
    },

    getStateFullName: (state) => (stateId) => {
      let stateFullName = stateId
      const _state = state.getStateById(stateId)
      if (_state.name) {
        stateFullName = _state.name
      }
      if (_state.eqId) {
        const equipment = state.getEquipmentById(_state.eqId)
        if (equipment.name) {
          stateFullName = `${equipment.name} > ${stateFullName}`
        }
      }
      return stateFullName
    },

    // return all scenarios
    getScenarios: (state) => () => {
      return Object.keys(state.scenarios)
        .map((scenarioId) => state.scenarios[scenarioId])
    },

    // return notifications count
    getNotificationsCount: (state) => state.notifications.length,

    // return room visibles equipments
    getRoomVisiblesEquipment: (state) => (roomId) => {
      try {
        return state.rooms[roomId].equipments
          .filter((equipmentId) => state.equipments[equipmentId].isVisible)
      } catch (error) {
        return []
      }
    },

    // return user view by code or null
    getUserViewByCode: (state) => (code) => {
      return (state.userViews[code]) || {}
    },

    activeUserViews: (state) => {
      return state.userViewsList.filter((userView) => userView.isActive)
    },

    // array data gatters
    arrEquipments: (state) => {
      return Object.values(state.equipments)
    },

    arrStates: (state) => {
      return Object.values(state.states)
    },

    arrActions: (state) => {
      return Object.values(state.actions)
    },

    arrChannels: (state) => {
      return Object.values(state.channels)
    },

    arrStatesWithEquipmentName: (pstate) => {
      return pstate.arrStates.map((state) => {
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
          const equipment = pstate.getEquipmentById(state.eqId)
          _state.equipmentName = equipment.name
          _state.equipmentIsVisible = equipment.isVisible
          _state.equipmentIsActive = equipment.isActive
        }
        return _state
      }).sort((a, b) => {
        if (a.equipmentName < b.equipmentName) {
          return -1
        }
        if (a.equipmentName > b.equipmentName) {
          return 1
        }
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      })
    },
    arrActionsWithEquipmentName: (pstate) => {
      return pstate.arrActions.map((action) => {
        const _action = {
          id: action.id,
          name: action.name,
          eqId: action.eqId,
          module: action.module,
          isAsk: action.isAsk,
          isVisible: action.isVisible,
          stateFeedbackId: action.stateFeedbackId,
          type: action.type,
          equipmentName: null,
          equipmentIsVisible: null,
          equipmentIsActive: null,
        }
        if (_action.eqId) {
          const equipment = pstate.getEquipmentById(action.eqId)
          _action.equipmentName = equipment.name
          _action.equipmentIsVisible = equipment.isVisible
          _action.equipmentIsActive = equipment.isActive
        }
        return _action
      }).sort((a, b) => {
        if (a.equipmentName < b.equipmentName) {
          return -1
        }
        if (a.equipmentName > b.equipmentName) {
          return 1
        }
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      })
    },
    arrEquipmentsWithRoomName: (pstate) => {
      return pstate.arrEquipments.map((equipment) => {
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
          const room = pstate.getRoomById(equipment.roomId)
          _equipment.roomName = room.name
          _equipment.roomIsVisible = room.isVisible
        }
        return _equipment
      }).sort((a, b) => {
        if (a.roomName < b.roomName) {
          return -1
        }
        if (a.roomName > b.roomName) {
          return 1
        }
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      })
    },
  },

  actions: {

    // store all rooms, equipments, states and actions normalized
    saveRooms (payload) {
      this.roomsRaw = payload
      const normalized = normalize(payload, roomListSchema)
      Object.assign(this, normalized.entities)
    },

    // store all room (update existing data in store)
    updateRooms (payload) {
      const roomsUpdated = {}
      payload.forEach((room) => {
        const id = room.id
        if (!this.rooms[id]) {
          // room was not in store
          roomsUpdated[id] = room
          return
        }
        // get room in store and assign updated attributes (keep attribute not provided)
        roomsUpdated[id] = this.rooms[id]
        for (const key in room) {
          roomsUpdated[id][key] = room[key]
        }
      })
      if (Object.keys(roomsUpdated).length > 0) {
        this.rooms = Object.assign({}, this.rooms, roomsUpdated)
      }
      // remove deleted rooms from store (not present in update)
      const roomIds = payload.map((room) => room.id)
      for (const key in this.rooms) {
        if (!roomIds.includes(key)) {
          delete this.rooms[key]
        }
      }
    },

    // store specific room, equipments, states and actions normalized
    saveRoom (payload) {
      const normalized = normalize(payload, roomSchema)
      if (Object.prototype.hasOwnProperty.call(this.rooms, payload.id)) {
        for (const key in normalized.entities.rooms[payload.id]) {
          this.rooms[payload.id][key] = normalized.entities.rooms[payload.id][key]
        }
      } else {
        this.rooms[payload.id] = normalized.entities.rooms[payload.id]
      }
      Object.assign(this.equipments, normalized.entities.equipments)
      Object.assign(this.states, normalized.entities.states)
      Object.assign(this.actions, normalized.entities.actions)
    },

    deleteRoom (roomId) {
      delete this.rooms[roomId]
      const index = this.roomsRaw.findIndex((room) => room.id === roomId)
      if (index !== -1) {
        this.roomsRaw.splice(index, 1)
      }
    },

    // store specific room summary
    saveRoomSummary (payload) {
      if (payload.id === 'global') {
        payload.id = 0
      }
      const info = {
        key: payload.key,
        value: payload.value,
      }
      let normalized = this.roomsSummary[payload.id]
      if (!normalized) {
        // there was no summary for this room
        normalized = {
          id: payload.id,
          keys: [info],
        }
      } else {
        // search the key in room summary
        const index = normalized.keys.findIndex((info) => info.key === payload.key)
        if (index !== -1) {
          // key found, update it
          normalized.keys.splice(index, 1, info)
        } else {
          // key not found, adding it
          normalized.keys.push(info)
        }
      }
      // normalized[payload.key] = payload.summary
      const arr = []
      arr[payload.id] = normalized
      this.roomsSummary = Object.assign({}, this.roomsSummary, arr)
    },

    // store state statistics
    saveStateStatistics (payload) {
      const updated = {}
      updated[payload.id] = payload.statistics
      this.statesStatistics = Object.assign({}, this.statesStatistics, updated)
    },

    // store updated equipments (batch)
    updateEquipments (payload) {
      const equipmentsUpdated = {}
      payload.forEach(equipment => {
        const id = equipment.id
        if (!this.equipments[id]) {
          // equipment was not in store
          // add actions and states attributes if not provided
          if (!equipment.actions) {
            equipment.actions = []
          }
          if (!equipment.states) {
            equipment.states = []
          }
          equipmentsUpdated[id] = equipment
          if (Object.prototype.hasOwnProperty.call(equipment, 'roomId') && equipment.roomId !== null) {
            // add equipment to room
            this.rooms[equipment.roomId].equipments.push(equipment.id)
          }
          // handle equipment tags
          if (Object.prototype.hasOwnProperty.call(equipment, 'tags')) {
            // get new tags to add to tags list
            this.tagsList = this.tagsList.concat(equipment.tags.filter((tag) => !this.tagsList.includes(tag)))
          }
          return
        }
        const previousRoomId = this.equipments[id].roomId
        equipmentsUpdated[id] = Object.assign({}, this.equipments[id])
        for (const key in equipment) {
          equipmentsUpdated[id][key] = equipment[key]
        }
        if (previousRoomId !== equipment.roomId) {
          // equipment has moved
          if (
            Object.prototype.hasOwnProperty.call(this.equipments[id], 'roomId') &&
            previousRoomId !== null
          ) {
            // remove from previous room
            const index = this.rooms[previousRoomId].equipments.indexOf(equipment.id)
            if (index !== -1) {
              this.rooms[previousRoomId].equipments.splice(index, 1)
            }
          }
          if (Object.prototype.hasOwnProperty.call(equipment, 'roomId') && equipment.roomId !== null) {
            // add to new room
            this.rooms[equipment.roomId].equipments.push(equipment.id)
          }
        }
        // handle equipment tags
        if (
          Object.prototype.hasOwnProperty.call(equipment, 'tags') && (
            !Object.prototype.hasOwnProperty.call(this.equipments, id) ||
            !Object.prototype.hasOwnProperty.call(this.equipments[id], 'tags') ||
            this.equipments[id].tags.length !== equipment.tags.length ||
            this.equipments[id].tags.some((value, index) => value !== equipment.tags[index])
          )) {
          // get new tags to add to tags list
          const addedTags = equipment.tags
            .filter((currentTag) => !Object.prototype.hasOwnProperty.call(this.equipments, id) || !this.equipments[id].tags.includes(currentTag))
            .filter((tag) => !this.tagsList.includes(tag))
          // get existing tags to remove from tags list (not used by any other equipment)
          if (Object.prototype.hasOwnProperty.call(this.equipments[id], 'tags')) {
            this.equipments[id].tags
              .filter((previousTag) => !equipment.tags.includes(previousTag))
              .filter((tag) => !Object.values(this.equipments).some((equipment) => equipment.id !== id && equipment.tags.includes(tag)))
              .forEach((removedTag) => {
                const index = this.tagsList.indexOf(removedTag)
                this.tagsList.splice(index, 1)
              })
          }
          this.tagsList = this.tagsList.concat(addedTags)
        }
      })
      if (Object.keys(equipmentsUpdated).length > 0) {
        this.equipments = Object.assign({}, this.equipments, equipmentsUpdated)
      }
    },

    deleteEquipment ({ equipmentId, roomId }) {
      if (Object.prototype.hasOwnProperty.call(this.equipments, equipmentId)) {
        this.equipments[equipmentId].tags
          .filter((tag) => !Object.values(this.equipments).some((equipment) => equipment.id !== equipmentId && equipment.tags.includes(tag)))
          .forEach((removedTag) => {
            const index = this.tagsList.indexOf(removedTag)
            this.tagsList.splice(index, 1)
          })
        if (roomId) {
          const index = this.rooms[roomId].equipments.indexOf(equipmentId)
          if (index !== -1) {
            this.rooms[roomId].equipments.splice(index, 1)
          }
        }
        delete this.equipments[equipmentId]
      }
    },

    // store updated states (batch)
    updateStates (payload) {
      const statesUpdated = {}
      payload.forEach((_state) => {
        const id = _state.id
        if (!this.states[id]) {
          // state was not in store
          statesUpdated[id] = _state
          if (
            Object.prototype.hasOwnProperty.call(_state, 'eqId') &&
              _state.eqId !== null &&
              Object.prototype.hasOwnProperty.call(this.equipments, _state.eqId)
          ) {
            // add state to equipment
            this.equipments[_state.eqId].states.push(_state.id)
          }
          return
        }
        const previousEqId = this.states[id].eqId
        statesUpdated[id] = Object.assign({}, this.states[id])
        for (const key in _state) {
          statesUpdated[id][key] = _state[key]
        }
        if (previousEqId !== _state.eqId) {
          // state has moved to another equipment
          if (
            Object.prototype.hasOwnProperty.call(this.states[id], 'eqId') &&
              previousEqId !== null &&
              Object.prototype.hasOwnProperty.call(this.equipments, previousEqId)
          ) {
            // remove state from previous equipment
            const index = this.equipments[previousEqId].states.indexOf(_state.id)
            if (index !== -1) {
              this.equipments[previousEqId].states.splice(index, 1)
            }
          }
          if (
            Object.prototype.hasOwnProperty.call(_state, 'eqId') &&
              _state.eqId !== null &&
              Object.prototype.hasOwnProperty.call(this.equipments, _state.eqId)
          ) {
            // add state to new equipment
            this.equipments[_state.eqId].states.push(_state.id)
          }
        }
      })
      if (Object.keys(statesUpdated).length > 0) {
        this.states = Object.assign({}, this.states, statesUpdated)
      }
    },

    // store updated actions (batch)
    updateActions (payload) {
      const actionsUpdated = {}
      payload.forEach((_action) => {
        const id = _action.id
        if (!this.actions[id]) {
          // action was not in store
          actionsUpdated[id] = _action
          if (
            Object.prototype.hasOwnProperty.call(_action, 'eqId') &&
              _action.eqId !== null &&
              Object.prototype.hasOwnProperty.call(this.equipments, _action.eqId)
          ) {
            // add to equipment
            this.equipments[_action.eqId].actions.push(_action.id)
          }
          return
        }
        const previousEqId = this.actions[id].eqId
        actionsUpdated[id] = Object.assign({}, this.actions[id])
        for (const key in _action) {
          actionsUpdated[id][key] = _action[key]
        }
        if (previousEqId !== _action.eqId) {
          // action has moved to another equipment
          if (
            Object.prototype.hasOwnProperty.call(this.actions[id], 'eqId') &&
              previousEqId !== null &&
              Object.prototype.hasOwnProperty.call(this.equipments, previousEqId)
          ) {
            // remove action from previous equipment
            const index = this.equipments[previousEqId].actions.indexOf(_action.id)
            if (index !== -1) {
              this.equipments[previousEqId].actions.splice(index, 1)
            }
          }
          if (
            Object.prototype.hasOwnProperty.call(_action, 'eqId') &&
              _action.eqId !== null &&
              Object.prototype.hasOwnProperty.call(this.equipments, _action.eqId)
          ) {
            // add action to new equipment
            this.equipments[_action.eqId].actions.push(_action.id)
          }
        }
      })
      if (Object.keys(actionsUpdated).length > 0) {
        this.actions = Object.assign({}, this.actions, actionsUpdated)
      }
    },

    // store updated states/actions (batch)
    updateStatesActions (payload) {
      const statesUpdated = {}
      const actionsUpdated = {}
      const equipmentsUpdated = {}
      payload.forEach(update => {
        const id = update.id
        if (!this.states[id] && !this.actions[id]) {
          return
        }
        if (this.states[id]) {
          statesUpdated[id] = this.states[id]
          statesUpdated[id].currentValue = update.currentValue
          // update equipment date with state collect date if it is newer
          const equipmentId = this.states[id].eqId
          if (new Date(update.collectDate) > new Date(this.equipments[equipmentId].lastCommunication)) {
            equipmentsUpdated[equipmentId] = this.equipments[equipmentId]
            equipmentsUpdated[equipmentId].lastCommunication = dtFormat(update.collectDate, 'ISO')
          }
        }
        if (this.actions[id]) {
          actionsUpdated[id] = this.actions[id]
          actionsUpdated[id].currentValue = update.currentValue
        }
      })
      if (Object.keys(statesUpdated).length > 0) {
        this.states = Object.assign({}, this.states, statesUpdated)
      }
      if (Object.keys(actionsUpdated).length > 0) {
        this.actions = Object.assign({}, this.actions, actionsUpdated)
      }
      if (Object.keys(equipmentsUpdated).length > 0) {
        this.equipments = Object.assign({}, this.equipments, equipmentsUpdated)
      }
    },

    updateChannels (payload) {
      const channelsUpdated = {}
      payload.forEach((_channel) => {
        const id = _channel.id
        if (!this.channels[id]) {
          // channel was not in store
          channelsUpdated[id] = _channel
          return
        }
        channelsUpdated[id] = Object.assign({}, this.channels[id])
        for (const key in _channel) {
          channelsUpdated[id][key] = _channel[key]
        }
      })
      if (Object.keys(channelsUpdated).length > 0) {
        this.channels = Object.assign({}, this.channels, channelsUpdated)
      }
    },

    deleteState ({ stateId, eqId }) {
      delete this.states[stateId]
      if (eqId) {
        const index = this.equipments[eqId].states.indexOf(stateId)
        if (index !== -1) {
          this.equipments[eqId].states.splice(index, 1)
        }
      }
    },

    deleteAction ({ actionId, eqId }) {
      delete this.actions[actionId]
      if (eqId) {
        const index = this.equipments[eqId].actions.indexOf(actionId)
        if (index !== -1) {
          this.equipments[eqId].actions.splice(index, 1)
        }
      }
    },

    deleteChannel ({ channelId }) {
      delete this.channels[channelId]
    },

    updateUserViews (payload) {
      const viewsUpdated = {}
      payload.forEach((_view) => {
        const code = _view.code
        if (!this.userViews[code]) {
          // view was not in store
          viewsUpdated[code] = _view
          return
        }
        viewsUpdated[code] = Object.assign({}, this.userViews[code])
        for (const key in _view) {
          viewsUpdated[code][key] = _view[key]
        }
      })
      if (Object.keys(viewsUpdated).length > 0) {
        this.userViews = Object.assign({}, this.userViews, viewsUpdated)
      }
      this.userViewsList = Object.values(this.userViews)
    },

    deleteUserView (code) {
      delete this.userViews[code]
      this.userViewsList = Object.values(this.userViews)
    },

    // store tags
    saveTags (payload) {
      this.tagsList = payload
    },

    // store scenarios
    saveScenarios (payload) {
      const normalized = normalize(payload, scenarioListSchema)
      Object.assign(this, normalized.entities)
    },

    // store updated scenario information
    updateScenario (payload) {
      if (!this.scenarios[payload.id]) {
        return
      }
      const updated = {}
      updated[payload.id] = this.scenarios[payload.id]
      updated[payload.id].state = payload.state
      this.scenarios = Object.assign({}, this.scenarios, updated)
    },

    // store all notifications
    saveNotifications (payload) {
      this.notifications = payload
    },

    // store new notification
    addNotification (payload) {
      this.notifications.push(payload)
      this.notifications.sort((a, b) => new Date(b.date) - new Date(a.date))
    },

    // clear state
    clear () {
      const defaultState = getDefaultState()
      Object.keys(defaultState).forEach((key) => {
        this[key] = defaultState[key]
      })
    },

    // call API and store rooms list
    async vxLoadRooms () {
      try {
        // get global summary
        provider.getSummary().then((summary) => {
          for (const key in summary) {
            if (summary[key] !== null) {
              this.saveRoomSummary({ id: 'global', key, value: summary[key] })
            }
          }
        }, (error) => {
          const appStore = useAppStore()
          appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la récupération du résumé global<br>${error.message}` })
        })
        // get all rooms
        const rooms = await provider.getRooms(true, true)
        if (rooms === undefined) {
          // no rooms to save
          return
        }
        this.saveRooms(rooms)
        // get tags
        let tagsList = []
        rooms.forEach((room) => {
          room.equipments.forEach((equipment) => {
            tagsList = tagsList.concat(equipment.tags)
          })
        })
        this.saveTags([...new Set(tagsList)])
        // get rooms summary
        let hasRoomSummary = false
        rooms.forEach((room) => {
          if (room.summary && Array.isArray(room.summary)) {
            hasRoomSummary = true
            room.summary.forEach((summary) => {
              this.saveRoomSummary({ id: room.id, key: summary.key, value: summary.value })
            })
          }
        })
        if (!hasRoomSummary) {
          rooms.forEach(async (room) => {
            for (const key in room.summary) {
              const value = await provider.getRoomSummary(room.id, key)
              this.saveRoomSummary({ id: room.id, key, value })
            }
          })
        }
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la récupération des pièces<br>${error.message}` })
      }
    },

    async vxRefreshRooms () {
      try {
        // get all rooms without details
        const rooms = await provider.getRooms(false, false)
        if (rooms === undefined) {
          // no rooms to save
          return
        }
        this.updateRooms(rooms)
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors du rafrichissement des pièces<br>${error.message}` })
      }
    },

    async vxSaveRoom ({ room, isNew }) {
      try {
        if (isNew) {
          room = await provider.createRoom(room)
        } else {
          room = await provider.updateRoom(room)
        }
        const _room = {
          id: room.id,
          isVisible: room.isVisible,
          name: room.name,
          parentId: room.parentId,
        }
        if (room.equipments) {
          _room.equipments = room.equipments
        }
        if (room.summary) {
          _room.summary = room.summary
        }
        this.saveRoom(room)
        return room
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: error.message })
        return false
      }
    },

    async vxDeleteRoom (roomId) {
      try {
        await provider.deleteRoom(roomId)
        this.deleteRoom(roomId)
        return true
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: error.message })
        return false
      }
    },

    async vxRefreshEquipments () {
      try {
        // get all rooms without details
        const equipments = await provider.getEquipments(false, false)
        if (equipments === undefined) {
          // no equipments to save
          return
        }
        this.updateEquipments(equipments)
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors du rafrichissement des équipements<br>${error.message}` })
      }
    },

    async vxSaveEquipment ({ equipment, isNew }) {
      try {
        if (isNew) {
          equipment = await provider.createEquipment(equipment)
        } else {
          equipment = await provider.updateEquipment(equipment)
        }
        this.updateEquipments([equipment])
        return equipment
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: error.message })
        return false
      }
    },

    async vxDeleteEquipment ({ equipmentId, roomId }) {
      try {
        await provider.deleteEquipment(equipmentId)
        this.deleteEquipment({ equipmentId, roomId })
        return true
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: error.message })
        return false
      }
    },

    async vxRefreshStates () {
      try {
        // get all states
        const states = await provider.getStates()
        if (states === undefined) {
          // no states to save
          return
        }
        this.updateStates(states)
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors du rafrichissement des états<br>${error.message}` })
      }
    },

    async vxSaveState ({ state, isNew }) {
      try {
        if (isNew) {
          state = await provider.createState(state)
        } else {
          state = await provider.updateState(state)
        }
        this.updateStates([state])
        return state
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la sauvegarde de l'état<br>${error.message}` })
        return false
      }
    },

    async vxDeleteState ({ stateId, eqId }) {
      try {
        await provider.deleteState(stateId)
        this.deleteState({ stateId, eqId })
        return true
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la suppression de l'état<br>${error.message}` })
        return false
      }
    },

    async vxRefreshActions () {
      try {
        // get all actions
        const actions = await provider.getActions()
        if (actions === undefined) {
          // no actions to save
          return
        }
        this.updateActions(actions)
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors du rafrichissement des actions<br>${error.message}` })
      }
    },

    async vxSaveAction ({ action, isNew }) {
      try {
        if (isNew) {
          action = await provider.createAction(action)
        } else {
          action = await provider.updateAction(action)
        }
        this.updateActions([action])
        return action
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la sauvegarde de l'action<br>${error.message}` })
        return false
      }
    },

    async vxDeleteAction ({ actionId, eqId }) {
      try {
        await provider.deleteAction(actionId)
        this.deleteAction({ actionId, eqId })
        return true
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la suppression de l'action<br>${error.message}` })
        return false
      }
    },

    // call API and store state statistics
    async vxLoadStateStatistics (id) {
      try {
        const statistics = await provider.getStatistics(id)
        if (statistics === undefined) {
          return
        }
        this.saveStateStatistics({ id, statistics })
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la récupération des statistiques<br>${error.message}` })
      }
    },

    // execute an action by calling API
    async vxExecuteAction (action) {
      try {
        await provider.executeAction(action.id, action.options)
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la requête d'exécution de la commande<br>${error.message}` })
      }
    },

    // call API and store scenarios
    async vxLoadScenarios () {
      try {
        const scenarios = await provider.getScenarios()
        if (scenarios === undefined) {
          return
        }
        this.saveScenarios(scenarios)
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la récupération des scénarios<br>${error.message}` })
      }
    },

    // call API and store notifications
    async vxLoadNotifications () {
      try {
        const notifications = await provider.getNotifications()
        if (notifications === undefined) {
          return
        }
        notifications.sort((a, b) => new Date(b.date) - new Date(a.date))
        this.saveNotifications(notifications)
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la récupération des notifications<br>${error.message}` })
      }
    },

    // call API and clear notifications
    async vxClearNotifications () {
      try {
        await provider.clearNotifications()
        this.saveNotifications([])
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la récupération des notifications<br>${error.message}` })
      }
    },

    async vxRefreshChannels () {
      try {
        // get all channels
        const channels = await provider.getChannels()
        if (channels === undefined) {
          // no channels to save
          return
        }
        this.updateChannels(channels)
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors du rafraichissement des canaux<br>${error.message}` })
      }
    },

    async vxSaveChannel ({ channel, isNew }) {
      try {
        if (isNew) {
          channel = await provider.createChannel(channel)
        } else {
          channel = await provider.updateChannel(channel)
        }
        this.updateChannels([channel])
        return channel
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la sauvegarde du canal<br>${error.message}` })
        return false
      }
    },

    async vxDeleteChannel ({ channelId }) {
      try {
        await provider.deleteChannel(channelId)
        this.deleteChannel({ channelId })
        return true
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la suppression du canal<br>${error.message}` })
        return false
      }
    },

    async vxRefreshUserViews () {
      try {
        // get all user's views
        const userViews = await provider.getUserViews()
        if (userViews === undefined) {
          // no views to save
          return
        }
        this.updateUserViews(userViews)
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors du rafraichissement des vues<br>${error.message}` })
      }
    },

    async vxSaveUserView ({ userView, isNew }) {
      try {
        if (isNew) {
          userView = await provider.createUserView(userView)
        } else {
          userView = await provider.updateUserView(userView)
        }
        this.updateUserViews([userView])
        return userView
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la sauvegarde de la vue utilisateur<br>${error.message}` })
        return false
      }
    },

    async vxDeleteUserView ({ viewId, viewCode }) {
      try {
        await provider.deleteUserView(viewId)
        this.deleteUserView(viewCode)
        return true
      } catch (error) {
        const appStore = useAppStore()
        appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la suppression de la vue utilisateur<br>${error.message}` })
        return false
      }
    },
  },

  persist: {
    key: `${custom.provider.system}-data`,
  },
})
