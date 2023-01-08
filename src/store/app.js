import { defineStore } from 'pinia'

import { useDataStore } from '@/store/data'

import { provider } from '@/services/Provider'

const getDefaultState = () => ({
  information: {},
})

export const useAppStore = defineStore('app', {
  state: () => ({
    hasNetwork: false,
    isEventsListenerOpening: false,
    hasEventsListenerOpen: false,
    hasPollingEventsListener: false,
    hasSidebarOpened: false,
    ...getDefaultState(),
  }),

  actions: {

    // store events listener status
    setEventsListenerStatus (payload) {
      this.hasEventsListenerOpen = payload
    },

    // store events listener mode (true: polling, false: websocket)
    setEventsListenerIsPolling (payload) {
      this.hasPollingEventsListener = payload
    },

    // store events listener opening status
    setEventsListenerOpeningStatus (payload) {
      this.isEventsListenerOpening = payload
    },

    // store connectivity status
    setNetworkStatus (payload) {
      this.hasNetwork = payload
    },

    // store informations to be displayed as toast
    setInformation (payload) {
      this.information = payload
    },

    setEventsListener (status, forceRefresh = false) {
      if (status) {
        if (!this.hasNetwork) {
          return
        }
        const dataStore = useDataStore()
        provider.openEventsListener(true, forceRefresh, this, dataStore)
        dataStore.vxLoadRooms()
      } else {
        provider.closeEventsListener(this)
      }
    },

    // clear state
    clear () {
      const defaultState = getDefaultState()
      Object.keys(defaultState).forEach((key) => {
        this[key] = defaultState[key]
      })
    },

    // store sidebar status
    setSidebarStatus (payload) {
      this.hasSidebarOpened = payload
    },
  },

})
