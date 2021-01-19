import Vue from 'vue'
import { normalize, schema } from 'normalizr'

const vue = new Vue()

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

const getDefaultState = () => {
  return {
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
    notifications: [],
  }
}

const state = getDefaultState()

const getters = {

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
  getStatesByEquipmentId: (state, getters) => (id) => {
    const states = []
    const statesId = state.equipments[id].states
    // reduce state to minimal informations
    statesId.forEach((stateId) => {
      const c = getters.getStateById(stateId)
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
  getActionsByEquipmentId: (state, getters) => (id) => {
    const actions = []
    const actionsId = state.equipments[id].actions
    // reduce action to minimal informations
    actionsId.forEach((actionId) => {
      const c = getters.getActionById(actionId)
      actions.push({
        id: c.id,
        type: c.type,
        stateFeedbackId: c.stateFeedbackId,
        isVisible: c.isVisible,
        options: c.options,
      })
    })
    return actions
  },

  // return states by id or empty array
  getStatesByIds: (state, getters) => (statesId) => {
    const states = []
    statesId.forEach((stateId) => {
      const c = getters.getStateById(stateId)
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
  getActionsByIds: (state, getters) => (actionsId) => {
    const actions = []
    actionsId.forEach((actionId) => {
      const c = getters.getActionById(actionId)
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

  // return state statistics by id or null
  getStateStatisticsById: (state) => (id) => {
    return (state.statesStatistics[id]) || null
  },

  // return all scenarios
  getScenarios: (state) => () => {
    return Object.keys(state.scenarios).map((scenarioId) => state.scenarios[scenarioId])
  },

  // return notifications count
  getNotificationsCount: (state) => () => {
    return state.notifications.length
  },

  // return room visibles equipments
  getRoomVisiblesEquipment: (state) => (roomId) => {
    return state.rooms[roomId].equipments
      .filter((equipmentId) => state.equipments[equipmentId].isVisible)
  },
}

const mutations = {

  // store all rooms, equipments, states and actions normalized
  saveRooms (state, payload) {
    state.roomsRaw = payload
    const normalized = normalize(payload, roomListSchema)
    Object.assign(state, normalized.entities)
  },

  // store all room (update existing data in store)
  updateRooms (state, payload) {
    const roomsUpdated = {}
    payload.forEach((room) => {
      const id = room.id
      if (!state.rooms[id]) {
        // room was not in store
        roomsUpdated[id] = room
        return
      }
      // get room in store and assign updated attributes (keep attribute not provided)
      roomsUpdated[id] = state.rooms[id]
      for (const key in room) {
        roomsUpdated[id][key] = room[key]
      }
    })
    if (Object.keys(roomsUpdated).length > 0) {
      state.rooms = Object.assign({}, state.rooms, roomsUpdated)
    }
    // remove deleted rooms from store (not present in update)
    const roomIds = payload.map((room) => room.id)
    for (const key in state.rooms) {
      if (!roomIds.includes(key)) {
        delete state.rooms[key]
      }
    }
  },

  // store specific room, equipments, states and actions normalized
  saveRoom (state, payload) {
    const normalized = normalize(payload, roomSchema)
    if (Object.prototype.hasOwnProperty.call(state.rooms, payload.id)) {
      for (const key in normalized.entities.rooms[payload.id]) {
        state.rooms[payload.id][key] = normalized.entities.rooms[payload.id][key]
      }
    } else {
      state.rooms[payload.id] = normalized.entities.rooms[payload.id]
    }
    Object.assign(state.equipments, normalized.entities.equipments)
    Object.assign(state.states, normalized.entities.states)
    Object.assign(state.actions, normalized.entities.actions)
  },

  deleteRoom (state, roomId) {
    delete state.rooms[roomId]
    const index = state.roomsRaw.findIndex((room) => room.id === roomId)
    if (index !== -1) {
      state.roomsRaw.splice(index, 1)
    }
  },

  // store specific room summary
  saveRoomSummary (state, payload) {
    if (payload.id === 'global') {
      payload.id = 0
    }
    const info = {
      key: payload.key,
      value: payload.value,
    }
    let normalized = state.roomsSummary[payload.id]
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
    state.roomsSummary = Object.assign({}, state.roomsSummary, arr)
  },

  // store state statistics
  saveStateStatistics (state, payload) {
    const updated = {}
    updated[payload.id] = payload.statistics
    state.statesStatistics = Object.assign({}, state.statesStatistics, updated)
  },

  // store updated equipments (batch)
  updateEquipments (state, payload) {
    const equipmentsUpdated = {}
    payload.forEach(equipment => {
      const id = equipment.id
      if (!state.equipments[id]) {
        // equipment was not in store
        equipmentsUpdated[id] = equipment
        // handle equipment tags
        if (Object.prototype.hasOwnProperty.call(equipment, 'tags')) {
          // get new tags to add to tags list
          state.tagsList = state.tagsList.concat(equipment.tags.filter((tag) => !state.tagsList.includes(tag)))
        }
        return
      }
      const previousRoomId = state.equipments[id].roomId
      equipmentsUpdated[id] = Object.assign({}, state.equipments[id])
      for (const key in equipment) {
        equipmentsUpdated[id][key] = equipment[key]
      }
      if (previousRoomId !== equipment.roomId) {
        // equipment has moved
        if (
          Object.prototype.hasOwnProperty.call(state.equipments[id], 'roomId') &&
          previousRoomId !== null
        ) {
          // remove from previous room
          const index = state.rooms[previousRoomId].equipments.indexOf(equipment.id)
          if (index !== -1) {
            state.rooms[previousRoomId].equipments.splice(index, 1)
          }
        }
        if (Object.prototype.hasOwnProperty.call(equipment, 'roomId') && equipment.roomId !== null) {
          // add to new room
          state.rooms[equipment.roomId].equipments.push(equipment.id)
        }
      }
      // handle equipment tags
      if (
        Object.prototype.hasOwnProperty.call(equipment, 'tags') && (
          state.equipments[id].tags.length !== equipment.tags.length ||
          state.equipments[id].tags.some((value, index) => value !== equipment.tags[index])
        )) {
        // get new tags to add to tags list
        const addedTags = equipment.tags
          .filter((currentTag) => !state.equipments[id].tags.includes(currentTag))
          .filter((tag) => !state.tagsList.includes(tag))
        // get existing tags to remove from tags list (not used by any other equipment)
        state.equipments[id].tags
          .filter((previousTag) => !equipment.tags.includes(previousTag))
          .filter((tag) => !Object.values(state.equipments).some((equipment) => equipment.id !== id && equipment.tags.includes(tag)))
          .forEach((removedTag) => {
            const index = state.tagsList.indexOf(removedTag)
            state.tagsList.splice(index, 1)
          })
        state.tagsList = state.tagsList.concat(addedTags)
      }
    })
    if (Object.keys(equipmentsUpdated).length > 0) {
      state.equipments = Object.assign({}, state.equipments, equipmentsUpdated)
    }
  },

  deleteEquipment (state, equipmentId) {
    if (Object.prototype.hasOwnProperty.call(state.equipments, equipmentId)) {
      state.equipments[equipmentId].tags
        .filter((tag) => !Object.values(state.equipments).some((equipment) => equipment.id !== equipmentId && equipment.tags.includes(tag)))
        .forEach((removedTag) => {
          const index = state.tagsList.indexOf(removedTag)
          state.tagsList.splice(index, 1)
        })
      delete state.equipments[equipmentId]
    }
  },

  // store updated states (batch)
  updateStates (state, payload) {
    const statesUpdated = {}
    payload.forEach((_state) => {
      const id = _state.id
      if (!state.states[id]) {
        // state was not in store
        statesUpdated[id] = _state
        return
      }
      statesUpdated[id] = state.states[id]
      for (const key in _state) {
        statesUpdated[id][key] = _state[key]
      }
    })
    if (Object.keys(statesUpdated).length > 0) {
      state.states = Object.assign({}, state.states, statesUpdated)
    }
  },

  // store updated actions (batch)
  updateActions (state, payload) {
    const actionsUpdated = {}
    payload.forEach((_action) => {
      const id = _action.id
      if (!state.actions[id]) {
        // action was not in store
        actionsUpdated[id] = _action
        return
      }
      actionsUpdated[id] = state.actions[id]
      for (const key in _action) {
        actionsUpdated[id][key] = _action[key]
      }
    })
    if (Object.keys(actionsUpdated).length > 0) {
      state.actions = Object.assign({}, state.actions, actionsUpdated)
    }
  },

  // store updated states/actions (batch)
  updateStatesActions (state, payload) {
    const statesUpdated = {}
    const actionsUpdated = {}
    const equipmentsUpdated = {}
    payload.forEach(update => {
      const id = update.id
      if (!state.states[id] && !state.actions[id]) {
        return
      }
      if (state.states[id]) {
        statesUpdated[id] = state.states[id]
        statesUpdated[id].currentValue = update.currentValue
        // update equipment date with state collect date if it is newer
        const equipmentId = state.states[id].eqId
        if (Vue.moment(update.collectDate).isAfter(state.equipments[equipmentId].lastCommunication)) {
          equipmentsUpdated[equipmentId] = state.equipments[equipmentId]
          equipmentsUpdated[equipmentId].lastCommunication = Vue.moment(update.collectDate).format()
        }
      }
      if (state.actions[id]) {
        actionsUpdated[id] = state.actions[id]
        actionsUpdated[id].currentValue = update.currentValue
      }
    })
    if (Object.keys(statesUpdated).length > 0) {
      state.states = Object.assign({}, state.states, statesUpdated)
    }
    if (Object.keys(actionsUpdated).length > 0) {
      state.actions = Object.assign({}, state.actions, actionsUpdated)
    }
    if (Object.keys(equipmentsUpdated).length > 0) {
      state.equipments = Object.assign({}, state.equipments, equipmentsUpdated)
    }
  },

  deleteState (state, stateId) {
    delete state.states[stateId]
  },

  deleteAction (state, actionId) {
    delete state.actions[actionId]
  },

  // store tags
  saveTags (state, payload) {
    state.tagsList = payload
  },

  // store scenarios
  saveScenarios (state, payload) {
    const normalized = normalize(payload, scenarioListSchema)
    Object.assign(state, normalized.entities)
  },

  // store updated scenario information
  updateScenario (state, payload) {
    if (!state.scenarios[payload.id]) {
      return
    }
    const updated = {}
    updated[payload.id] = state.scenarios[payload.id]
    updated[payload.id].state = payload.state
    state.scenarios = Object.assign({}, state.scenarios, updated)
  },

  // store all notifications
  saveNotifications (state, payload) {
    state.notifications = payload
  },

  // store new notification
  addNotification (state, payload) {
    state.notifications.push(payload)
    state.notifications.sort((a, b) => Vue.moment(b.date) - Vue.moment(a.date))
  },

  // clear state
  clear (state) {
    Object.assign(state, getDefaultState())
  },
}

const actions = {

  // call API and store rooms list
  async loadRooms ({ commit }) {
    try {
      // get global summary
      vue.$Provider.getSummary().then((summary) => {
        for (const key in summary) {
          if (summary[key] !== null) {
            commit('saveRoomSummary', { id: 'global', key, value: summary[key] })
          }
        }
      }, (error) => {
        commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la récupération du résumé global<br>${error.message}` }, { root: true })
      })
      // get all rooms
      const rooms = await vue.$Provider.getRooms(true, true)
      if (rooms === undefined) {
        // no rooms to save
        return
      }
      commit('saveRooms', rooms)
      // get tags
      let tagsList = []
      rooms.forEach((room) => {
        room.equipments.forEach((equipment) => {
          tagsList = tagsList.concat(equipment.tags)
        })
      })
      commit('saveTags', [...new Set(tagsList)])
      // get rooms summary
      let hasRoomSummary = false
      rooms.forEach((room) => {
        if (room.summary && Array.isArray(room.summary)) {
          hasRoomSummary = true
          room.summary.forEach((summary) => {
            commit('saveRoomSummary', { id: room.id, key: summary.key, value: summary.value })
          })
        }
      })
      if (!hasRoomSummary) {
        rooms.forEach(async (room) => {
          for (const key in room.summary) {
            const value = await vue.$Provider.getRoomSummary(room.id, key)
            commit('saveRoomSummary', { id: room.id, key, value })
          }
        })
      }
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la récupération des pièces<br>${error.message}` }, { root: true })
    }
  },

  async vxRefreshRooms ({ commit }) {
    try {
      // get all rooms without details
      const rooms = await vue.$Provider.getRooms(false, false)
      if (rooms === undefined) {
        // no rooms to save
        return
      }
      commit('updateRooms', rooms)
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors du rafrichissement des pièces<br>${error.message}` }, { root: true })
    }
  },

  async vxSaveRoom ({ commit }, { room, isNew }) {
    try {
      if (isNew) {
        room = await vue.$Provider.createRoom(room)
      } else {
        room = await vue.$Provider.updateRoom(room)
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
      commit('saveRoom', _room)
      return room
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: error.message }, { root: true })
      return false
    }
  },

  async vxDeleteRoom ({ commit }, roomId) {
    try {
      await vue.$Provider.deleteRoom(roomId)
      commit('deleteRoom', roomId)
      return true
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: error.message }, { root: true })
      return false
    }
  },

  async vxRefreshEquipments ({ commit }) {
    try {
      // get all rooms without details
      const equipments = await vue.$Provider.getEquipments(false, false)
      if (equipments === undefined) {
        // no equipments to save
        return
      }
      commit('updateEquipments', equipments)
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors du rafrichissement des équipements<br>${error.message}` }, { root: true })
    }
  },

  async vxSaveEquipment ({ commit }, { equipment, isNew }) {
    try {
      if (isNew) {
        equipment = await vue.$Provider.createEquipment(equipment)
      } else {
        equipment = await vue.$Provider.updateEquipment(equipment)
      }
      commit('updateEquipments', [equipment])
      return equipment
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: error.message }, { root: true })
      return false
    }
  },

  async vxDeleteEquipment ({ commit }, equipmentId) {
    try {
      await vue.$Provider.deleteEquipment(equipmentId)
      commit('deleteEquipment', equipmentId)
      return true
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: error.message }, { root: true })
      return false
    }
  },

  async vxRefreshStates ({ commit }) {
    try {
      // get all states
      const states = await vue.$Provider.getStates()
      if (states === undefined) {
        // no states to save
        return
      }
      commit('updateStates', states)
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors du rafrichissement des états<br>${error.message}` }, { root: true })
    }
  },

  async vxSaveState ({ commit }, { state, isNew }) {
    try {
      if (isNew) {
        state = await vue.$Provider.createState(state)
      } else {
        state = await vue.$Provider.updateState(state)
      }
      commit('updateStates', [state])
      return state
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la sauvegarde de l'état<br>${error.message}` }, { root: true })
      return false
    }
  },

  async vxDeleteState ({ commit }, stateId) {
    try {
      await vue.$Provider.deleteState(stateId)
      commit('deleteState', stateId)
      return true
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la suppression de l'état<br>${error.message}` }, { root: true })
      return false
    }
  },

  async vxRefreshActions ({ commit }) {
    try {
      // get all actions
      const actions = await vue.$Provider.getActions()
      if (actions === undefined) {
        // no actions to save
        return
      }
      commit('updateActions', actions)
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors du rafrichissement des actions<br>${error.message}` }, { root: true })
    }
  },

  async vxSaveAction ({ commit }, { action, isNew }) {
    try {
      if (isNew) {
        action = await vue.$Provider.createAction(action)
      } else {
        action = await vue.$Provider.updateAction(action)
      }
      commit('updateActions', [action])
      return action
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la sauvegarde de l'action<br>${error.message}` }, { root: true })
      return false
    }
  },

  async vxDeleteAction ({ commit }, actionId) {
    try {
      await vue.$Provider.deleteAction(actionId)
      commit('deleteAction', actionId)
      return true
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la suppression de l'action<br>${error.message}` }, { root: true })
      return false
    }
  },

  // call API and store state statistics
  async loadStateStatistics ({ commit, state }, id) {
    try {
      const statistics = await vue.$Provider.getStatistics(id)
      if (statistics === undefined) {
        return
      }
      commit('saveStateStatistics', { id, statistics })
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la récupération des statistiques<br>${error.message}` }, { root: true })
    }
  },

  // execute an action by calling API
  async executeAction ({ commit }, action) {
    try {
      await vue.$Provider.executeAction(action.id, action.options)
    } catch (error) {
      console.error(error)
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la requête d'exécution de la commande<br>${error.message}` }, { root: true })
    }
  },

  // call API and store scenarios
  async loadScenarios ({ commit }) {
    try {
      const scenarios = await vue.$Provider.getScenarios()
      if (scenarios === undefined) {
        return
      }
      commit('saveScenarios', scenarios)
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la récupération des scénarios<br>${error.message}` }, { root: true })
    }
  },

  // call API and store notifications
  async loadNotifications ({ commit }) {
    try {
      const notifications = await vue.$Provider.getNotifications()
      if (notifications === undefined) {
        return
      }
      notifications.sort((a, b) => Vue.moment(b.date) - Vue.moment(a.date))
      commit('saveNotifications', notifications)
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la récupération des notifications<br>${error.message}` }, { root: true })
    }
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
