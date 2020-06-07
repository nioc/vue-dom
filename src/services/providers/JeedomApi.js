import axios from 'axios'

const JeedomApi = function (Vue, jsonRpcApiUrl = null, websocketUrl = null, store = null, statisticsPeriod = 86400000) {
  const socketMaxTry = 3
  const readDelay = 5000
  let apiKey = null
  let websocket = null
  let timerId = null
  let socketErrorCount = 0
  let isSocketOpen = false
  let lastEventsTimestamp = Date.now() / 1000

  function convertIconClass (jIcon) {
    let iconClass = jIcon.match(/class="(.*?)"/)[1]
    // transform font awesome 4 to 5
    switch (iconClass) {
      case 'fas fa-refresh':
        iconClass = 'fa fa-sync-alt'
        break
      case 'fas fa-smile-o':
        iconClass = 'far fa-smile'
        break
    }
    return iconClass || 'fa fa-question'
  }

  // Execute a JSON RPC request and return result
  async function jsonRpcCall (method, params) {
    if (apiKey === null && method !== 'user::getHash') {
      throw new Error('Missing API key')
    }
    // set Axios config
    const config = {
      headers: {
      },
    }
    // set request data
    if (params === undefined) {
      params = {}
    }
    const data = {
      jsonrpc: '2.0',
      id: +new Date(),
      method,
      params,
    }
    // add API key to data
    data.params = { ...data.params, ...{ apikey: apiKey } }
    // execute request
    const response = await axios.post(jsonRpcApiUrl, data, config)
    if (response.data.error) {
      // handle business error
      throw response.data.error
    }
    // return result
    return response.data.result
  }

  function handleEventsResponse (events) {
    lastEventsTimestamp = events.datetime
    const updateCmds = []
    events.result.forEach((event) => {
      switch (event.name) {
        case 'cmd::update': {
          updateCmds.push({
            id: event.option.cmd_id,
            currentValue: event.option.value,
            collectDate: event.option.collectDate,
          })
          break
        }
        case 'jeeObject::summary::update':
          for (const key in event.option.keys) {
            store.commit('data/saveObjectSummary', { id: event.option.object_id, key, value: event.option.keys[key].value })
          }
          break
        case 'scenario::update':
          store.commit('data/updateScenario', {
            id: event.option.scenario_id,
            state: event.option.state,
          })
          break
        case 'jeedom::alert': {
          // Jeedom alert
          let type = 'is-danger'
          switch (event.option.level) {
            case 'success':
              type = 'is-success'
              break
            case 'info':
              type = 'is-info'
              break
            case 'warning':
              type = 'is-warning'
              break
          }
          store.commit('app/setInformation', { type, message: event.option.message })
          break
        }
        case 'notify': {
          // Jeedom message
          let type = 'is-danger'
          let message = ''
          switch (event.option.category) {
            case 'message':
              type = 'is-info'
              break
            default:
              break
          }
          if (event.option.title) {
            message += `${event.option.title}<br>`
          }
          if (event.option.message) {
            message += event.option.message
          }
          store.commit('app/setInformation', { type, message })
          store.commit('data/addNotification', {
            date: Vue.moment().format('YYYY-MM-DD HH:mm:ss'),
            message: event.option.message,
          })
          break
        }
        default:
          break
      }
    })
    // commit cmd::update batch
    if (updateCmds.length > 0) {
      store.commit('data/updateStates', updateCmds)
    }
  }

  return {

    // request user API key from his credentials
    async getApiKey (login, password) {
      try {
        return await jsonRpcCall('user::getHash', { login, password })
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // initialize API key
    setApiKey (_apiKey) {
      apiKey = _apiKey
    },

    // suscribe to Jeedom events throught websocket
    openEventsListener (resetCounter, forceRefresh = false) {
      if (!store.state.app.hasNetwork) {
        // no network
        return
      }
      if (websocketUrl === null) {
        // websocket url not set, fallback to HTTP polling
        this.openEventsListenerFallback(true)
        return
      }
      if (!apiKey) {
        console.warn('Missing API key')
        store.commit('app/setInformation', { type: 'is-danger', message: 'Erreur d\'authentification, veuillez-vous reconnecter' })
        store.commit('app/setUser', { login: null, isAuthenticated: false })
        return
      }
      // ensure only one socket
      if (isSocketOpen) {
        console.warn('Socket already opened')
        return
      }
      if (forceRefresh) {
        this.openEventsListenerFallback(false)
      }
      isSocketOpen = true
      // reset error count
      if (resetCounter) {
        socketErrorCount = 0
      }
      // start websocket
      websocket = new WebSocket(websocketUrl)
      // on open connection, execute callback function and send user API key
      websocket.onopen = (event) => {
        console.info('Events socket connection opened')
        const authMsg = JSON.stringify({ apiKey })
        websocket.send(authMsg)
        store.commit('app/setEventsListenerStatus', true)
      }
      // on message, handle events
      websocket.onmessage = (message) => {
        try {
          handleEventsResponse(JSON.parse(message.data))
        } catch (error) {
          console.error('Error during events parsing', error)
        }
      }
      // on error, increment counter
      websocket.onerror = (event) => {
        console.error('Error occurs on events socket', event)
        socketErrorCount++
      }
      // on connection close, store status and retry if it was an abnormal closure
      websocket.onclose = (event) => {
        store.commit('app/setEventsListenerStatus', false)
        isSocketOpen = false
        switch (event.code) {
          case 1000:
          case 1001:
            // normal closure, do nothing
            break
          case 1006:
            // abnormal closure
            if (!store.state.app.hasNetwork) {
              // no network
              console.warn(`Network failure, events socket connection closed (code: ${event.code}, try #${socketErrorCount}/${socketMaxTry})`)
              return
            }
            if (socketErrorCount >= socketMaxTry) {
              console.warn(`Events socket connection closed (code: ${event.code}, try #${socketErrorCount}/${socketMaxTry})`)
              this.openEventsListenerFallback(true)
              return
            }
            // try to reconnect
            console.warn(`Events socket connection closed (code: ${event.code}, try #${socketErrorCount}/${socketMaxTry}), reconnecting...`)
            this.openEventsListener(false, false)
            break
          default:
            console.warn(`Events socket connection closed (code: ${event.code}, try #${socketErrorCount})`)
        }
      }
    },

    // close websocket connection
    closeEventsListener () {
      if (websocket) {
        websocket.close()
      }
      if (timerId) {
        clearTimeout(timerId)
        store.commit('app/setEventsListenerStatus', false)
      }
    },

    // request events by JSON-RPC API
    async openEventsListenerFallback (isPolling) {
      try {
        store.commit('app/setEventsListenerStatus', true)
        const events = await jsonRpcCall('event::changes', { datetime: lastEventsTimestamp })
        lastEventsTimestamp = events.datetime
        handleEventsResponse(events)
        if (isPolling) {
          timerId = setTimeout(function () { this.openEventsListenerFallback(true) }.bind(this), readDelay)
        }
        return
      } catch (error) {
        store.commit('app/setEventsListenerStatus', false)
        store.commit('app/setInformation', { type: 'is-danger', message: 'Erreur de communication avec le serveur' })
        console.error(error)
      }
    },

    // request all objects and returns only visible ones
    async getObjects () {
      try {
        const jObjects = await jsonRpcCall('object::full')
        return jObjects.map((jObject) => {
          // construct object
          const object = {
            id: jObject.id,
            name: jObject.name,
            parentId: jObject.father_id,
            isVisible: jObject.isVisible === '1',
            summary: {},
            equipments: [],
          }
          // set object summary keys
          for (const key in jObject.configuration.summary) {
            let keyHasSummary = false
            const elements = jObject.configuration.summary[key]
            elements.forEach((element) => {
              if (element.enable === '1') {
                keyHasSummary = true
              }
            })
            if (keyHasSummary) {
              object.summary[key] = true
            }
          }
          // set object equipments
          object.equipments = jObject.eqLogics.filter((jEqLogic) => jEqLogic.isVisible === '1').map((jEqLogic) => {
          // construct equipment
            const equipment = {
              id: jEqLogic.id,
              module: jEqLogic.eqType_name,
              name: jEqLogic.name,
              cmds: [],
              tags: jEqLogic.tags ? jEqLogic.tags.split(',') : [],
            }
            if (jEqLogic.configuration.type) {
              equipment.configuration = {
                type: jEqLogic.configuration.type,
              }
            }
            if (jEqLogic.status) {
              if (jEqLogic.status.battery) {
                equipment.battery = jEqLogic.status.battery
              }
              if (jEqLogic.status.lastCommunication) {
                equipment.lastCommunication = Vue.moment(jEqLogic.status.lastCommunication).format()
              }
            }
            // set equipment actions
            equipment.actions = jEqLogic.cmds.filter((jCmd) => jCmd.type === 'action').sort((a, b) => a.order - b.order).map((jCmd) => {
              // construct cmd
              const cmd = {
                id: jCmd.id,
                logicalId: jCmd.logicalId,
                name: jCmd.name,
                eqId: jCmd.eqLogic_id,
                module: jCmd.eqType,
                type: jCmd.subType,
                genericType: jCmd.generic_type,
                isVisible: jCmd.isVisible === '1',
                order: jCmd.order,
              }
              if (jCmd.display.icon) {
                cmd.icon = convertIconClass(jCmd.display.icon)
              }
              if (jCmd.value) {
                cmd.stateFeedbackId = jCmd.value.replace(/#/g, '')
              }
              if (jCmd.configuration.minValue && jCmd.configuration.minValue !== '') {
                cmd.minValue = parseInt(jCmd.configuration.minValue)
              }
              if (jCmd.configuration.maxValue && jCmd.configuration.maxValue !== '') {
                cmd.maxValue = parseInt(jCmd.configuration.maxValue)
              }
              return cmd
            })
            // set equipment states
            equipment.states = jEqLogic.cmds.filter((jCmd) => jCmd.type === 'info').sort((a, b) => a.order - b.order).map((jCmd) => {
              // construct cmd
              const cmd = {
                id: jCmd.id,
                logicalId: jCmd.logicalId,
                name: jCmd.name,
                eqId: jCmd.eqLogic_id,
                module: jCmd.eqType,
                type: jCmd.subType,
                genericType: jCmd.generic_type,
                isHistorized: jCmd.isHistorized === '1',
                isVisible: jCmd.isVisible === '1',
                order: jCmd.order,
                currentValue: jCmd.state,
                unit: jCmd.unite,
              }
              if (jCmd.display.icon) {
                cmd.icon = convertIconClass(jCmd.display.icon)
              }
              if (jCmd.configuration.minValue && jCmd.configuration.minValue !== '') {
                cmd.minValue = parseInt(jCmd.configuration.minValue)
              }
              if (jCmd.configuration.maxValue && jCmd.configuration.maxValue !== '') {
                cmd.maxValue = parseInt(jCmd.configuration.maxValue)
              }
              return cmd
            })
            return equipment
          })
          return object
        })
      } catch (error) {
        console.error(error)
      }
    },

    // request global summary
    async getSummary () {
      try {
        return await jsonRpcCall('summary::global')
      } catch (error) {
        console.error(error)
      }
    },

    // request key object summary
    async getObjectSummary (objectId, key) {
      try {
        return await jsonRpcCall('summary::byId', { id: objectId, key })
      } catch (error) {
        console.error(error)
      }
    },

    // execute a command
    async executeAction (actionId, options) {
      const params = { id: actionId }
      if (options) {
        params.options = options
      }
      try {
        return await jsonRpcCall('cmd::execCmd', params)
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // request all scenarios and returns only visible ones
    async getScenarios () {
      try {
        const scenarios = await jsonRpcCall('scenario::all')
        return scenarios.filter((scenario) => scenario.isVisible === '1')
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // change scenario state (run, stop, enable, disable)
    async changeScenarioState (id, state) {
      try {
        return await jsonRpcCall('scenario::changeState', { id, state })
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // request cmd statistics and return min, max and average
    async getStatistics (cmdId, startTime = null, endTime = null) {
      const params = { id: parseInt(cmdId) }
      if (endTime === null) {
        endTime = new Date()
      }
      if (startTime === null) {
        startTime = new Date(endTime.getTime() - statisticsPeriod)
      }
      params.startTime = Vue.moment(startTime).format('YYYY-MM-DD HH:mm:ss')
      params.endTime = Vue.moment(endTime).format('YYYY-MM-DD HH:mm:ss')
      try {
        const statistics = await jsonRpcCall('cmd::getStatistique', params)
        if (statistics.count === '0') {
          return null
        }
        return {
          min: Number.parseFloat(Number.parseFloat(statistics.min).toPrecision(3)),
          avg: Number.parseFloat(Number.parseFloat(statistics.avg).toPrecision(3)),
          max: Number.parseFloat(Number.parseFloat(statistics.max).toPrecision(3)),
        }
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // request cmd history
    async getHistory (cmdId, startTime = null, endTime = null) {
      const params = { id: parseInt(cmdId) }
      if (endTime === null) {
        endTime = new Date()
      }
      if (startTime === null) {
        startTime = new Date(endTime.getTime() - 86400000)
      }
      params.startTime = Vue.moment(startTime).format('YYYY-MM-DD HH:mm:ss')
      params.endTime = Vue.moment(endTime).format('YYYY-MM-DD HH:mm:ss')
      try {
        return await jsonRpcCall('cmd::getHistory', params)
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // try to ask a question
    async askQuestion (query, replyCmd = null) {
      const params = {
        query,
      }
      if (replyCmd !== null) {
        params.reply_cmd = replyCmd
      }
      try {
        const result = await jsonRpcCall('interact::tryToReply', params)
        if (!result.reply) {
          console.error('no reply found')
          throw new Error('Aucune réponse trouvée')
        }
        return result.reply.replace(/(\\+n)+/g, '<br/>')
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // request defined interactions
    async getSentences () {
      try {
        const sentences = await jsonRpcCall('interactQuery::all')
        return sentences.map((sentence) => {
          return sentence.query
        })
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // request system notifications
    async getNotifications () {
      try {
        const notifications = await jsonRpcCall('message::all')
        return notifications.map((log) => {
          // remove HTML encoding
          const txt = document.createElement('textarea')
          txt.innerHTML = log.message
          log.message = txt.value
          return log
        })
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    // delete system notifications
    async clearNotifications () {
      try {
        const result = await jsonRpcCall('message::removeAll')
        if (result !== 'ok') {
          throw new Error('Erreur lors de la suppression')
        }
      } catch (error) {
        console.error(error)
        throw error
      }
    },

  }
}

export { JeedomApi }
