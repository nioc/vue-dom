import Vue from 'vue'
import { normalize, schema } from 'normalizr'

const vue = new Vue()

// prepare data normalization schemas
const cmdSchema = new schema.Entity('cmds')
const equipmentSchema = new schema.Entity('equipments', {
  cmds: [cmdSchema],
})
const objectSchema = new schema.Entity('objects', {
  equipments: [equipmentSchema],
})
const objectListSchema = new schema.Array(objectSchema)
const scenarioSchema = new schema.Entity('scenarios')
const scenarioListSchema = new schema.Array(scenarioSchema)

const getDefaultState = () => {
  return {
    objects: {},
    objectsSummary: {},
    objectsRaw: [],
    equipments: {},
    cmds: {},
    objectsList: [],
    summaryList: [],
    cmdsStatistics: {},
    tagsList: [],
    scenarios: {},
    notifications: [],
  }
}

const state = getDefaultState()

const getters = {

  // return object by id or object with empty name and equipments
  getObjectById: (state) => (id) => {
    return (state.objects[id]) || {
      name: '',
      equipments: [],
    }
  },

  // return object summary by id or empty object
  getObjectSummaryById: (state) => (id) => {
    return (state.objectsSummary[id]) || {}
  },

  // return equipment by id or object with empty cmds
  getEquipmentById: (state) => (id) => {
    return (state.equipments[id]) || {
      cmds: [],
    }
  },

  // return equipments ids by tag
  getEquipmentsIdByTag: (state) => (tag) => {
    return Object.values(state.equipments).filter((equipment) => equipment.tags.includes(tag)).map((equipment) => equipment.id)
  },

  // return all cmds for requested equipment id
  getCmdsByEquipmentId: (state, getters) => (id) => {
    const cmds = []
    const cmdsId = state.equipments[id].cmds
    // reduce cmd to minimal informations
    cmdsId.forEach((cmdId) => {
      const c = getters.getCmdById(cmdId)
      cmds.push({
        id: c.id,
        type: c.type,
        stateFeedbackId: c.stateFeedbackId,
        subType: c.subType,
        genericType: c.genericType,
        isVisible: c.isVisible,
      })
    })
    return cmds
  },

  // return cmds by id or empty array
  getCmdsByIds: (state, getters) => (cmdsId) => {
    const cmds = []
    cmdsId.forEach((cmdId) => {
      const c = getters.getCmdById(cmdId)
      cmds.push({
        id: c.id,
        type: c.type,
        stateFeedbackId: c.stateFeedbackId,
        subType: c.subType,
        genericType: c.genericType,
        isVisible: c.isVisible,
      })
    })
    return cmds
  },

  // return cmd by id or empty object
  getCmdById: (state) => (id) => {
    return (state.cmds[id]) || { }
  },

  // return cmd statistics by id or null
  getCmdStatisticsById: (state) => (id) => {
    return (state.cmdsStatistics[id]) || null
  },

  // return all scenarios
  getScenarios: (state) => () => {
    return Object.keys(state.scenarios).map((scenarioId) => state.scenarios[scenarioId])
  },

  // return notifications count
  getNotificationsCount: (state) => () => {
    return state.notifications.length
  },
}

const mutations = {

  // store all objects, equipments and cmds normalized
  saveObjects (state, payload) {
    state.objectsRaw = payload
    const normalized = normalize(payload, objectListSchema)
    Object.assign(state, normalized.entities)
  },

  // store specific object, equipments and cmds normalized
  saveObject (state, payload) {
    const normalized = normalize(payload, objectSchema)
    state.objectsList.push(normalized.result)
    Object.assign(state.objects, normalized.entities.objects)
    Object.assign(state.equipments, normalized.entities.equipments)
    Object.assign(state.cmds, normalized.entities.cmds)
  },

  // store specific object summary
  saveObjectSummary (state, payload) {
    if (payload.id === 'global') {
      payload.id = 0
    }
    const info = {
      key: payload.key,
      value: payload.value,
    }
    let normalized = state.objectsSummary[payload.id]
    if (!normalized) {
      // there was no summary for this object
      normalized = {
        id: payload.id,
        keys: [info],
      }
    } else {
      // search the key in object summary
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
    state.objectsSummary = Object.assign({}, state.objectsSummary, arr)
  },

  // store cmd statistics
  saveCmdStatistics (state, payload) {
    const cmdId = payload.id
    const updated = {}
    updated[cmdId] = payload.statistics
    state.cmdsStatistics = Object.assign({}, state.cmdsStatistics, updated)
  },

  // store updated cmds information (batch)
  updateCmds (state, payload) {
    const updated = {}
    const equipmentUpdated = {}
    payload.forEach(updateCmd => {
      const cmdId = updateCmd.id
      if (!state.cmds[cmdId]) {
        return
      }
      updated[cmdId] = state.cmds[cmdId]
      updated[cmdId].currentValue = updateCmd.currentValue
      // update equipment date with cmd collect date if it is newer
      const equipmentId = state.cmds[cmdId].eqId
      if (Vue.moment(updateCmd.collectDate).isAfter(state.equipments[equipmentId].lastCommunication)) {
        equipmentUpdated[equipmentId] = state.equipments[equipmentId]
        equipmentUpdated[equipmentId].lastCommunication = Vue.moment(updateCmd.collectDate).format()
      }
    })
    if (Object.keys(updated).length > 0) {
      state.cmds = Object.assign({}, state.cmds, updated)
    }
    if (Object.keys(equipmentUpdated).length > 0) {
      state.equipments = Object.assign({}, state.equipments, equipmentUpdated)
    }
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

  // call API and store objects list
  async loadObjects ({ commit }) {
    try {
      // get global summary
      vue.$Provider.getSummary().then((summary) => {
        for (const key in summary) {
          if (summary[key] !== null) {
            commit('saveObjectSummary', { id: 'global', key, value: summary[key] })
          }
        }
      }, (error) => {
        commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la récupération du résumé global<br>${error.message}` }, { root: true })
      })
      // get all objects
      const objects = await vue.$Provider.getObjects()
      if (objects === undefined) {
        // no objects to save
        return
      }
      commit('saveObjects', objects)
      // get tags
      let tagsList = []
      objects.forEach((object) => {
        object.equipments.forEach((equipment) => {
          tagsList = tagsList.concat(equipment.tags)
        })
      })
      commit('saveTags', [...new Set(tagsList)])
      // get objects summary
      objects.forEach(async (object) => {
        for (const key in object.summary) {
          const value = await vue.$Provider.getObjectSummary(object.id, key)
          commit('saveObjectSummary', { id: object.id, key, value })
        }
      })
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la récupération des objets<br>${error.message}` }, { root: true })
    }
  },

  // call API and store cmd statistics
  async loadCmdStatistics ({ commit, state }, id) {
    try {
      const statistics = await vue.$Provider.getStatistics(id)
      if (statistics === undefined) {
        return
      }
      commit('saveCmdStatistics', { id, statistics })
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la récupération des statistiques<br>${error.message}` }, { root: true })
    }
  },

  // call cmd API
  async execCmd ({ commit }, cmd) {
    try {
      await vue.$Provider.cmd(cmd.id, cmd.options)
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
