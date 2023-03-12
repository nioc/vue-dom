import { AbstractProvider } from '@/services/providers/AbstractProvider'
import axios from 'axios'
import { dtFormat } from '@/services/Datetime'
import { useAppStore } from '@/store/app'
import { useDataStore } from '@/store/data'
import { useAuthStore } from '@/store/auth'

class Provider extends AbstractProvider {
  /**
   * Create a Jeedom provider instance.
   * @param {object} options
   * @param {string} options.jsonRpcApiUrl - Jeedom backend API base url, ex: `https://10.0.0.10/core/api/jeeApi.php`
   * @param {string} [options.websocketUrl=null] - Jeedom backend events websocket url, `null` disable websocket,  ex: `wss://10.0.0.10/websocket`
   * @param {number} [options.readDelay=5000] - Delay between two events request in polling mode
   * @param {number} [options.statisticsPeriod=86400000] - Depth history for statistics
   * @param {number} [options.trendPeriod=3600000] - Duration in ms for trend calculation
   * @param {number} [options.trendThreshold=0.1] - Threshold for calculate trend
   */
  constructor (options = {}) {
    super('Jeedom')
    if (!options.jsonRpcApiUrl) {
      throw new Error('Missing `jsonRpcApiUrl` in provider configuration, check your local.js')
    }
    this.jsonRpcApiUrl = options.jsonRpcApiUrl
    this.websocketUrl = options.websocketUrl
    this.readDelay = options.readDelay || 5000
    this.statisticsPeriod = options.statisticsPeriod || 86400000
    this.trendPeriod = options.trendPeriod || 3600000
    this.trendThreshold = options.trendThreshold || 0.1
    // internals
    this.socketMaxTry = 3
    this.apiKey = null
    this.websocket = null
    this.timerId = null
    this.socketErrorCount = 0
    this.isSocketOpen = false
    this.lastEventsTimestamp = Date.now() / 1000
  }

  // private methods
  #convertIconClass (jIcon) {
    let iconClass = jIcon.match(/class=["'](.*?)["']/)[1]
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
  async #jsonRpcCall (method, params) {
    if (this.apiKey === null && method !== 'user::getHash') {
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
    data.params = { ...data.params, ...{ apikey: this.apiKey } }
    // execute request
    const response = await axios.post(this.jsonRpcApiUrl, data, config)
    if (response.data.error) {
      // handle business error
      throw response.data.error
    }
    // return result
    return response.data.result
  }

  #handleEventsResponse (events, appStore, dataStore) {
    this.lastEventsTimestamp = events.datetime
    const updateCmds = []
    events.result.forEach((event) => {
      switch (event.name) {
        case 'cmd::update': {
          // convert boolean value
          const state = dataStore.getStateById(event.option.cmd_id)
          const currentValue = (state && state.type === 'boolean') ? event.option.value === 1 : event.option.value
          updateCmds.push({
            id: event.option.cmd_id,
            currentValue,
            collectDate: event.option.collectDate,
          })
          break
        }
        case 'jeeObject::summary::update':
          for (const key in event.option.keys) {
            dataStore.saveRoomSummary({ id: event.option.object_id, key, value: event.option.keys[key].value })
          }
          break
        case 'scenario::update':
          dataStore.updateScenario({
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
          appStore.setInformation({ type, message: event.option.message })
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
          appStore.setInformation({ type, message })
          dataStore.addNotification({
            date: dtFormat(new Date(), 'yyyy-MM-dd HH:mm:ss'),
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
      dataStore.updateStatesActions(updateCmds)
    }
  }

  // public methods

  // request user API key from his credentials
  async authenticate (login, password) {
    try {
      return await this.#jsonRpcCall('user::getHash', { login, password })
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // initialize authentication (API key)
  async setAuthentication (_apiKey) {
    this.apiKey = _apiKey
    return _apiKey
  }

  // logout (not implemented with Api key)
  logout () {
  }

  // return all roles
  getAllRoles () {
    return []
  }

  // return user roles
  getRoles () {
    return []
  }

  // return user identifier
  getUserId () {
    return undefined
  }

  // suscribe to Jeedom events throught websocket
  openEventsListener (resetCounter, forceRefresh = false) {
    const appStore = useAppStore()
    const dataStore = useDataStore()
    if (!appStore.hasNetwork) {
      // no network
      return
    }
    if (this.websocketUrl === null) {
      // websocket url not set, fallback to HTTP polling
      this.#openEventsListenerFallback(true, appStore, dataStore)
      return
    }
    if (!this.apiKey) {
      console.warn('Missing API key')
      appStore.setInformation({ type: 'is-danger', message: 'Erreur d\'authentification, veuillez-vous reconnecter' })
      const authStore = useAuthStore()
      authStore.setUser({ login: null, isAuthenticated: false })
      return
    }
    // ensure only one socket
    if (this.isSocketOpen) {
      console.warn('Socket already opened')
      return
    }
    if (forceRefresh) {
      this.#openEventsListenerFallback(true, appStore, dataStore)
    }
    this.isSocketOpen = true
    // reset error count
    if (resetCounter) {
      this.socketErrorCount = 0
    }
    // start websocket
    this.websocket = new WebSocket(this.websocketUrl)
    // on open connection, execute callback function and send user API key
    this.websocket.onopen = () => {
      console.info('Events socket connection opened')
      const authMsg = JSON.stringify({ apiKey: this.apiKey })
      this.websocket.send(authMsg)
      appStore.setEventsListenerStatus(true)
    }
    // on message, handle events
    this.websocket.onmessage = (message) => {
      try {
        this.#handleEventsResponse(JSON.parse(message.data), appStore, dataStore)
      } catch (error) {
        console.error('Error during events parsing', error)
      }
    }
    // on error, increment counter
    this.websocket.onerror = (event) => {
      console.error('Error occurs on events socket', event)
      this.socketErrorCount++
    }
    // on connection close, store status and retry if it was an abnormal closure
    this.websocket.onclose = (event) => {
      appStore.setEventsListenerStatus(false)
      this.isSocketOpen = false
      switch (event.code) {
        case 1000:
        case 1001:
          // normal closure, do nothing
          break
        case 1006:
          // abnormal closure
          if (!appStore.hasNetwork) {
            // no network
            console.warn(`Network failure, events socket connection closed (code: ${event.code}, try #${this.socketErrorCount}/${this.socketMaxTry})`)
            return
          }
          if (this.socketErrorCount >= this.socketMaxTry) {
            console.warn(`Events socket connection closed (code: ${event.code}, try #${this.socketErrorCount}/${this.socketMaxTry})`)
            this.#openEventsListenerFallback(true, appStore, dataStore)
            return
          }
          // try to reconnect
          console.warn(`Events socket connection closed (code: ${event.code}, try #${this.socketErrorCount}/${this.socketMaxTry}), reconnecting...`)
          this.openEventsListener(false, false)
          break
        default:
          console.warn(`Events socket connection closed (code: ${event.code}, try #${this.socketErrorCount})`)
      }
    }
  }

  // close websocket connection
  closeEventsListener () {
    if (this.websocket) {
      this.websocket.close()
    }
    if (this.timerId) {
      clearTimeout(this.timerId)
      const appStore = useAppStore()
      appStore.setEventsListenerStatus(false)
      appStore.setEventsListenerIsPolling(true)
    }
  }

  // request events by JSON-RPC API
  async #openEventsListenerFallback (isPolling, appStore, dataStore) {
    try {
      appStore.setEventsListenerStatus(true)
      const events = await this.#jsonRpcCall('event::changes', { datetime: this.lastEventsTimestamp })
      this.lastEventsTimestamp = events.datetime
      this.#handleEventsResponse(events, appStore, dataStore)
      if (isPolling) {
        this.timerId = setTimeout(function () {
          this.#openEventsListenerFallback(true, appStore, dataStore)
        }.bind(this), this.readDelay)
        appStore.setEventsListenerIsPolling(true)
      }
      return
    } catch (error) {
      appStore.setEventsListenerStatus(false)
      appStore.setInformation({ type: 'is-danger', message: 'Erreur de communication avec le serveur' })
      console.error(error)
    }
  }

  // request all rooms and returns only visible ones
  async getRooms () {
    try {
      const jObjects = await this.#jsonRpcCall('object::full')
      return jObjects.map((jObject) => {
        // construct room
        const room = {
          id: jObject.id,
          name: jObject.name,
          parentId: jObject.father_id,
          isVisible: jObject.isVisible === '1',
          summary: {},
          equipments: [],
        }
        // set room summary keys
        for (const key in jObject.configuration.summary) {
          let keyHasSummary = false
          const elements = jObject.configuration.summary[key]
          elements.forEach((element) => {
            if (element.enable === '1') {
              keyHasSummary = true
            }
          })
          if (keyHasSummary) {
            room.summary[key] = true
          }
        }
        // set room equipments
        room.equipments = jObject.eqLogics.filter((jEqLogic) => jEqLogic.isVisible === '1').map((jEqLogic) => {
        // construct equipment
          const equipment = {
            id: jEqLogic.id,
            module: jEqLogic.eqType_name,
            name: jEqLogic.name,
            isVisible: true,
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
            if (jEqLogic.status.batterydanger || jEqLogic.status.batterywarning) {
              equipment.hasLowBattery = true
            }
            if (jEqLogic.status.lastCommunication) {
              equipment.lastCommunication = dtFormat(jEqLogic.status.lastCommunication, 'ISO')
            }
            if (jEqLogic.status.timeout || jEqLogic.status.warning || jEqLogic.status.danger) {
              equipment.hasNoCommunication = true
            }
          }
          // set equipment actions
          equipment.actions = jEqLogic.cmds.filter((jCmd) => jCmd.type === 'action').sort((a, b) => a.order - b.order).map((jCmd) => {
            const action = {
              id: jCmd.id,
              logicalId: jCmd.logicalId,
              name: jCmd.name,
              eqId: jCmd.eqLogic_id,
              module: jCmd.eqType,
              type: jCmd.subType.replace('other', 'button'),
              isVisible: jCmd.isVisible === '1',
              order: jCmd.order,
              needsConfirm: false,
            }
            switch (jCmd.generic_type) {
              case 'LIGHT_OFF':
              case 'ENERGY_OFF':
                action.type = 'switch_off'
                break
              case 'LIGHT_ON':
              case 'ENERGY_ON':
                action.type = 'switch_on'
                break
              case 'LIGHT_TOGGLE':
                action.type = 'switch'
                break
              case 'LIGHT_SLIDER':
                action.type = 'slider'
                break
            }
            if (jCmd.display.icon) {
              action.icon = this.#convertIconClass(jCmd.display.icon)
            }
            if (jCmd.value) {
              action.stateFeedbackId = jCmd.value.replace(/#/g, '')
            }
            if (jCmd.configuration.minValue && jCmd.configuration.minValue !== '') {
              action.minValue = parseInt(jCmd.configuration.minValue)
            }
            if (jCmd.configuration.maxValue && jCmd.configuration.maxValue !== '') {
              action.maxValue = parseInt(jCmd.configuration.maxValue)
            }
            if (jCmd.configuration.actionConfirm && jCmd.configuration.actionConfirm === '1') {
              action.needsConfirm = true
            }
            if (jCmd.configuration.listValue) {
              action.options = jCmd.configuration.listValue
                .split(';')
                .map((option) => {
                  const valueLabel = option.split('|')
                  return {
                    value: valueLabel[0],
                    label: valueLabel[1] || valueLabel[0],
                  }
                })
            }
            return action
          })
          // set equipment states
          equipment.states = jEqLogic.cmds.filter((jCmd) => jCmd.type === 'info').sort((a, b) => a.order - b.order).map((jCmd) => {
            const state = {
              id: jCmd.id,
              logicalId: jCmd.logicalId,
              name: jCmd.name,
              eqId: jCmd.eqLogic_id,
              module: jCmd.eqType,
              type: jCmd.subType.replace('binary', 'boolean'),
              genericType: jCmd.generic_type,
              isHistorized: jCmd.isHistorized === '1',
              isVisible: jCmd.isVisible === '1',
              order: jCmd.order,
              currentValue: jCmd.state,
              unit: jCmd.unite,
            }
            if (state.type === 'boolean') {
              state.currentValue = state.currentValue === 1
            }
            if (jCmd.display.icon) {
              state.icon = this.#convertIconClass(jCmd.display.icon)
            }
            if (jCmd.configuration.minValue && jCmd.configuration.minValue !== '') {
              state.minValue = parseInt(jCmd.configuration.minValue)
            }
            if (jCmd.configuration.maxValue && jCmd.configuration.maxValue !== '') {
              state.maxValue = parseInt(jCmd.configuration.maxValue)
            }
            return state
          })
          return equipment
        })
        return room
      })
    } catch (error) {
      console.error(error)
    }
  }

  // request global summary
  async getSummary () {
    try {
      const summary = await this.#jsonRpcCall('summary::global')
      for (const key in summary) {
        if (!summary[key].value) {
          delete summary[key]
          continue
        }
        summary[key] = summary[key].value
      }
      return summary
    } catch (error) {
      console.error(error)
    }
  }

  // request key room summary
  async getRoomSummary (roomId, key) {
    try {
      return await this.#jsonRpcCall('summary::byId', { id: roomId, key })
    } catch (error) {
      console.error(error)
    }
  }

  getBrowsersList () {
    return [
    ]
  }

  // execute a command
  async executeAction (actionId, options) {
    const params = { id: actionId }
    if (options) {
      params.options = options
      if (options.isConfirmed) {
        params.confirmAction = '1'
        delete options.isConfirmed
      }
    }
    try {
      return await this.#jsonRpcCall('cmd::execCmd', params)
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // request all scenarios and returns only visible ones
  async getScenarios () {
    try {
      const scenarios = await this.#jsonRpcCall('scenario::all')
      return scenarios
        .filter((scenario) => scenario.isVisible === '1' && scenario.isActive === '1')
        .map((scenario) => {
          scenario.isVisible = true
          scenario.isActive = true
          scenario.name = scenario.display.name
          delete scenario.display
          return scenario
        })
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // change scenario state (run, stop, enable, disable)
  async changeScenarioState (id, state) {
    try {
      return await this.#jsonRpcCall('scenario::changeState', { id, state })
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // request cmd statistics and return min, max and average
  async getStatistics (cmdId, startTime = null, endTime = null) {
    const params = { id: parseInt(cmdId) }
    if (endTime === null) {
      endTime = new Date()
    }
    if (startTime === null) {
      startTime = new Date(endTime.getTime() - this.statisticsPeriod)
    }
    params.startTime = dtFormat(startTime, 'yyyy-MM-dd HH:mm:ss')
    params.endTime = dtFormat(endTime, 'yyyy-MM-dd HH:mm:ss')
    const result = {
      min: null,
      max: null,
      avg: null,
      trend: null,
    }
    try {
      const statistics = await this.#jsonRpcCall('cmd::getStatistique', params)
      if (statistics.count !== '0') {
        result.min = Number.parseFloat(Number.parseFloat(statistics.min).toPrecision(3))
        result.avg = Number.parseFloat(Number.parseFloat(statistics.avg).toPrecision(3))
        result.max = Number.parseFloat(Number.parseFloat(statistics.max).toPrecision(3))
      }
      params.startTime = dtFormat(new Date(endTime.getTime() - this.trendPeriod), 'yyyy-MM-dd HH:mm:ss')
      const trendThresholdCoef = 10
      const trend = await this.#jsonRpcCall('cmd::getTendance', params)
      if (trend <= -this.trendThreshold * trendThresholdCoef) {
        result.trend = -2
      } else if (trend <= -this.trendThreshold) {
        result.trend = -1
      } else if (trend < this.trendThreshold) {
        result.trend = 0
      } else if (trend < this.trendThreshold * trendThresholdCoef) {
        result.trend = 1
      } else {
        result.trend = 2
      }
      return result
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // request cmd history
  async getHistory (cmdId, startTime = null, endTime = null) {
    const params = { id: parseInt(cmdId) }
    if (endTime === null) {
      endTime = new Date()
    }
    if (startTime === null) {
      startTime = new Date(endTime.getTime() - 86400000)
    }
    params.startTime = dtFormat(startTime, 'yyyy-MM-dd HH:mm:ss')
    params.endTime = dtFormat(endTime, 'yyyy-MM-dd HH:mm:ss')
    try {
      const history = await this.#jsonRpcCall('cmd::getHistory', params)
      return history.map((point) => {
        return {
          value: parseFloat(point.value),
          date: new Date(point.datetime).getTime(),
        }
      })
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // request all user views
  async getUserViews () {
    return []
  }

  // request channel
  async getUserView () {
    return null
  }

  // create channel
  async createUserView () {
    return null
  }

  // update channel
  async updateUserView () {
    return null
  }

  // delete channel
  async deleteUserView () {
    return null
  }

  // try to ask a question
  async askQuestion (query, replyCmd = null) {
    const params = {
      query,
    }
    if (replyCmd !== null) {
      // eslint-disable-next-line camelcase
      params.reply_cmd = replyCmd
    }
    try {
      const result = await this.#jsonRpcCall('interact::tryToReply', params)
      if (!result.reply) {
        console.error('no reply found')
        throw new Error('Aucune réponse trouvée')
      }
      return result.reply.replace(/(\\+n)+/g, '<br/>')
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // request defined interactions
  async getSentences () {
    try {
      const sentences = await this.#jsonRpcCall('interactQuery::all')
      return sentences.map((sentence) => {
        return sentence.query
      })
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // request system notifications
  async getNotifications () {
    try {
      const notifications = await this.#jsonRpcCall('message::all')
      return notifications.map((log) => {
        // remove HTML encoding
        const txt = document.createElement('textarea')
        txt.innerHTML = log.message
        log.message = txt.value
        log.source = log.plugin
        log.level = null
        return log
      })
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // delete system notifications
  async clearNotifications () {
    try {
      const result = await this.#jsonRpcCall('message::removeAll')
      if (result !== 'ok') {
        throw new Error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export { Provider }
