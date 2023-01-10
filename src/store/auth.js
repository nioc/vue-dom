import { defineStore, getActivePinia } from 'pinia'
import { provider } from '@/services/Provider'
const custom = window.custom

const getDefaultState = () => ({
  login: null,
  id: null,
  isAuthenticated: false,
  roles: [],
})

export const useAuthStore = defineStore('auth', {
  state: () => getDefaultState(),

  getters: {
    // return if current user has requested role
    hasRole: (state) => (requestedRole) => {
      return state.roles.includes(requestedRole)
    },
  },

  actions: {

    // set authentication (API key, token, ...) and notify application user is authenticated
    async setAuthentication (login, authentication) {
      const roles = provider.getRoles(authentication)
      const id = provider.getUserId(authentication)
      authentication = await provider.setAuthentication(authentication)
      this.setUser({ isAuthenticated: true, login, roles, id })
      return authentication
    },

    // send a request to the login URL and save the returned api key
    async doLogin (login, password, remember) {
      if (!login || !password) {
        return false
      }
      let authentication = await provider.authenticate(login, password)
      if (!authentication) {
        return false
      }
      authentication = await this.setAuthentication(login, authentication)
      if (remember) {
        const storageKey = `${custom.provider.system}-user`
        localStorage.setItem(storageKey, JSON.stringify({ login, authentication }))
      }
      return true
    },

    // clear local storage and store
    async logout () {
      try {
        await provider.logout()
      } catch (error) {
        console.error(error.message)
      }
      // clear local storage
      const storageKey = `${custom.provider.system}-user`
      localStorage.removeItem(storageKey)
      // clear all stores
      const stores = getActivePinia()._s
      stores.forEach((store) => store.clear())
    },

    // get previous authentication from local storage
    async restoreUser () {
      try {
        const storageKey = `${custom.provider.system}-user`
        const user = JSON.parse(localStorage.getItem(storageKey))
        if (user) {
          this.loginWithPreviousAuthentication(user.login, user.authentication, true)
        }
      } catch (e) {
        console.error('Error during restore user', e)
      }
    },

    // login with a previous authentication and store it if requested
    async loginWithPreviousAuthentication (login, providedAuthentication, remember) {
      const authentication = await this.setAuthentication(login, providedAuthentication)
      if (remember) {
        // update stored user
        const storageKey = `${custom.provider.system}-user`
        localStorage.setItem(storageKey, JSON.stringify({ login, authentication }))
      }
    },

    // store user login and authentication status
    setUser (payload) {
      this.login = payload.login
      this.id = payload.id
      this.isAuthenticated = payload.isAuthenticated
      this.roles = payload.roles
    },

    // clear state
    clear () {
      const defaultState = getDefaultState()
      Object.keys(defaultState).forEach((key) => {
        this[key] = defaultState[key]
      })
    },
  },

})
