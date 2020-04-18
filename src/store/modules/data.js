import Vue from 'vue'
import { normalize, schema } from 'normalizr'

const vue = new Vue()

// prepare data normalization schemas
const cmdSchema = new schema.Entity('cmds')
const eqLogicSchema = new schema.Entity('eqLogics', {
  cmds: [cmdSchema],
})
const objectSchema = new schema.Entity('objects', {
  eqLogics: [eqLogicSchema],
})
const objectListSchema = new schema.Array(objectSchema)

const getDefaultState = () => {
  return {
    objects: {},
    objectsSummary: {},
    objectsRaw: [],
    eqLogics: {},
    cmds: {},
    objectsList: [],
    summaryList: [],
    cmdsStatistics: {},
  }
}

const state = getDefaultState()

const getters = {

  // return object by id or object with empty name and eqLogics
  getObjectById: (state) => (id) => {
    return (state.objects[id]) || {
      name: '',
      eqLogics: [],
    }
  },

  // return object summary by id or empty object
  getObjectSummaryById: (state) => (id) => {
    return (state.objectsSummary[id]) || {}
  },

  // return eqLogic by id or object with empty cmds
  getEqLogicById: (state) => (id) => {
    return (state.eqLogics[id]) || {
      cmds: [],
    }
  },

  // return all cmds for requested eqLogicId
  getCmdsByEqLogicId: (state, getters) => (id) => {
    const cmds = []
    const cmdsId = state.eqLogics[id].cmds
    // reduce cmd to minimal informations
    cmdsId.forEach((cmdId) => {
      const c = getters.getCmdById(cmdId)
      cmds.push({
        id: c.id,
        type: c.type,
        value: c.value,
        subType: c.subType,
        generic_type: c.generic_type,
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
}

const mutations = {

  // store all objects, eqLogics and cmds normalized
  saveObjects (state, payload) {
    state.objectsRaw = payload
    const normalized = normalize(payload, objectListSchema)
    // get previous eqLogics
    for (const objectId in normalized.entities.objects) {
      if (state.objects[objectId] && state.objects[objectId].eqLogics) {
        normalized.entities.objects[objectId].eqLogics = state.objects[objectId].eqLogics
      }
    }
    Object.assign(state, normalized.entities)
  },

  // store specific object, eqLogics and cmds normalized
  saveObject (state, payload) {
    const normalized = normalize(payload, objectSchema)
    state.objectsList.push(normalized.result)
    Object.assign(state.objects, normalized.entities.objects)
    Object.assign(state.eqLogics, normalized.entities.eqLogics)
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

  // store updated cmd information
  updateCmd (state, payload) {
    const cmdId = payload.cmd_id
    if (!state.cmds[cmdId]) {
      return
    }
    const updated = {}
    updated[cmdId] = state.cmds[cmdId]
    updated[cmdId].currentValue = payload.display_value
    state.cmds = Object.assign({}, state.cmds, updated)
    // update eqLogic date with cmd collect date if it is newer
    const eqLogicId = state.cmds[cmdId].eqLogic_id
    if (Vue.moment(payload.collectDate).isAfter(state.eqLogics[eqLogicId].status.lastCommunication)) {
      const eqLogicUpdated = {}
      eqLogicUpdated[eqLogicId] = state.eqLogics[eqLogicId]
      eqLogicUpdated[eqLogicId].status.lastCommunication = payload.collectDate
      state.eqLogics = Object.assign({}, state.eqLogics, eqLogicUpdated)
    }
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
      vue.$JeedomApi.getSummary().then((summary) => {
        for (const key in summary) {
          if (summary[key] !== null) {
            commit('saveObjectSummary', { id: 'global', key, value: summary[key] })
          }
        }
      }, (error) => {
        commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la récupération du résumé global<br>${error.message}` }, { root: true })
      })
      // get all objects
      const objects = await vue.$JeedomApi.getObjects()
      if (objects === undefined) {
        // no objects to save
        return
      }
      commit('saveObjects', objects)
      // get objects summary
      objects.forEach(async (object) => {
        const objectSummary = object.configuration.summary
        for (const key in objectSummary) {
          let keyHasSummary = false
          const elements = objectSummary[key]
          elements.forEach((element) => {
            if (element.enable === '1') {
              keyHasSummary = true
            }
          })
          if (keyHasSummary) {
            const value = await vue.$JeedomApi.getObjectSummary(object.id, key)
            commit('saveObjectSummary', { id: object.id, key, value })
          }
        }
      })
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la récupération des objets<br>${error.message}` }, { root: true })
    }
  },

  // if not already fetched, call API and store object
  async loadObject ({ commit, state }, id) {
    if (state.objectsList.includes(id)) {
      return
    }
    try {
      const object = await vue.$JeedomApi.getObject(id)
      if (object === undefined) {
        // no object to save
        return
      }
      commit('saveObject', object)
    } catch (error) {
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la récupération de l'objet<br>${error.message}` }, { root: true })
    }
  },

  // call API and store cmd statistics
  async loadCmdStatistics ({ commit, state }, id) {
    try {
      const statistics = await vue.$JeedomApi.getStatistics(id)
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
      await vue.$JeedomApi.cmd(cmd.id, cmd.options)
    } catch (error) {
      console.error(error)
      commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la requête d'exécution de la commande<br>${error.message}` }, { root: true })
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
