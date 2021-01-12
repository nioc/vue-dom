const getDefaultState = () => {
  return {
    login: null,
    isAuthenticated: false,
    roles: [],
    information: {},
  }
}

const state = {
  hasNetwork: false,
  hasEventsListenerOpen: false,
  hasSidebarOpened: false,
  ...getDefaultState(),
}

const getters = {
}

const mutations = {

  // store user login and authentication status
  setUser (state, payload) {
    state.login = payload.login
    state.id = payload.id
    state.isAuthenticated = payload.isAuthenticated
    state.roles = payload.roles
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

  // clear state
  clear (state) {
    const defaultState = getDefaultState()
    Object.keys(defaultState).forEach((key) => {
      state[key] = defaultState[key]
    })
  },

  // store sidebar status
  setSidebarStatus (state, payload) {
    state.hasSidebarOpened = payload
  },
}

const actions = {
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
