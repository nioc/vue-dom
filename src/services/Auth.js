import Vue from 'vue'
import store from '@/store'
const custom = window.custom

// set authentication (API key, token, ...) and notify application user is authenticated
async function setAuthentication (login, authentication) {
  const vue = new Vue()
  const roles = vue.$Provider.getRoles(authentication)
  const id = vue.$Provider.getUserId(authentication)
  authentication = await vue.$Provider.setAuthentication(authentication)
  store.commit('app/setUser', { isAuthenticated: true, login, roles, id })
  return authentication
}

export default {

  // send a request to the login URL and save the returned api key
  async login (login, password, remember) {
    if (!login || !password) {
      return false
    }
    let authentication = await new Vue().$Provider.authenticate(login, password)
    if (!authentication) {
      return false
    }
    authentication = await setAuthentication(login, authentication)
    if (remember) {
      const storageKey = `${custom.provider.system}-user`
      localStorage.setItem(storageKey, JSON.stringify({ login, authentication }))
    }
    return true
  },

  // clear local storage and store
  async logout () {
    try {
      await new Vue().$Provider.logout()
    } catch (error) {
    }
    store.dispatch('clear')
  },

  // get stored user (login and credentials) and login with
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
    const authentication = await setAuthentication(login, providedAuthentication)
    if (remember) {
      // update stored user
      const storageKey = `${custom.provider.system}-user`
      localStorage.setItem(storageKey, JSON.stringify({ login, authentication }))
    }
  },
}
