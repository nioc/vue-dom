import Vue from 'vue'
import Vuex from 'vuex'
import { normalize, schema } from 'normalizr'

Vue.use(Vuex)

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

export default new Vuex.Store({
  state: {
    objects: {},
    objectsSummary: {},
    objectsRaw: [],
    eqLogics: {},
    cmds: {},
    objectsList: [],
    summaryList: [],
    login: null,
    isAuthenticated: false,
    hasEventsListenerOpen: false,
    hasNetwork: false,
    information: {},
  },

  getters: {
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
  },
  mutations: {

    // store user login and authentication status
    setUser (state, payload) {
      state.login = payload.login
      state.isAuthenticated = payload.isAuthenticated
    },

    // store websocket status
    setEventsListenerStatus (state, payload) {
      state.hasEventsListenerOpen = payload
    },

    // store connectivity status
    setNetworkStatus (state, payload) {
      state.hasNetwork = payload
    },

    // store informations to be displayed as toast
    setInformation (state, payload) {
      state.information = payload
    },

    // store all objects, eqLogics and cmds normalized
    saveObjects (state, payload) {
      state.objectsRaw = payload
      const normalized = normalize(payload, objectListSchema)
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

    // store updated cmd information
    updateCmd (state, payload) {
      const cmdId = payload.cmd_id
      if (!state.cmds[cmdId]) {
        return
      }
      const previous = state.cmds[cmdId]
      const updated = {}
      updated[cmdId] = previous
      updated[cmdId].currentValue = payload.display_value
      state.cmds = Object.assign({}, state.cmds, updated)
    },
  },

  actions: {
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
          commit('setInformation', { type: 'is-danger', message: 'Erreur sur l\'appel d\'API' + error.message })
        })
        // get all objects
        const objects = await vue.$JeedomApi.getObjects()
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
        commit('setInformation', { type: 'is-danger', message: 'Erreur sur l\'appel d\'API' })
      }
    },

    // if not already fetched, call API and store object
    async loadObject ({ commit }, id) {
      if (this.state.objectsList.includes(id)) {
        return
      }
      try {
        const object = await vue.$JeedomApi.getObject(id)
        commit('saveObject', object)
      } catch (error) {
        commit('setInformation', { type: 'is-danger', message: 'Erreur sur l\'appel d\'API' })
      }
    },

    // call cmd API
    async execCmd ({ commit }, cmd) {
      try {
        await vue.$JeedomApi.cmd(cmd.id, cmd.options)
      } catch (error) {
        console.error(error)
        commit('setInformation', { type: 'is-danger', message: 'Erreur sur l\'appel d\'API' + error.message })
      }
    },
  },

  strict: process.env.NODE_ENV !== 'production',
})
