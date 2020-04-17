import Vue from 'vue'
import store from '@/store'

// set API key and notify application user is authenticated
function authenticate (login, apiKey) {
  new Vue().$JeedomApi.setApiKey(apiKey)
  store.commit('app/setUser', { isAuthenticated: true, login })
}

export default {

  // send a request to the login URL and save the returned api key
  async login (login, password, remember) {
    if (!login || !password) {
      return false
    }
    const apiKey = await new Vue().$JeedomApi.getApiKey(login, password)
    if (!apiKey) {
      return false
    }
    authenticate(login, apiKey)
    if (remember) {
      localStorage.setItem('user', JSON.stringify({ login, apiKey }))
    }
    return true
  },

  // clear local storage and store
  logout () {
    store.dispatch('clear')
    localStorage.clear()
    sessionStorage.clear()
  },

  // return stored user (login and api key)
  restoreUser () {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user) {
        authenticate(user.login, user.apiKey)
      }
    } catch (e) {
      console.error('Error during restore user', e)
    }
  },
}
