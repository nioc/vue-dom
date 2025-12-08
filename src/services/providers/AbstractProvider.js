/* eslint-disable no-unused-vars */
export class AbstractProvider {
  /**
   * Create a provider instance.
   * @param {string} name - The provider name.
   */
  constructor (name = 'Unknown') {
    this.name = name
    if (this.constructor !== AbstractProvider) {
      // check that the provider class has required methods
      const requiredMethods = [
        'authenticate',
        'setAuthentication',
        'getAllRoles',
        'getRoles',
        'getUserId',
        'openEventsListener',
        'closeEventsListener',
        'hasOidc',
      ]
      const missingMethods = requiredMethods.filter((methodName) => typeof this[methodName] !== 'function')
      if (missingMethods.length > 0) {
        console.error(`Provider ${name} does not implement all mandatory methods: ${missingMethods.join(', ')}`)
      }
    }
  }

  #getErrorMessage (methodName) {
    return `Provider ${this.name} does not implement ${methodName ? methodName : 'requested'} method`
  }

  // Required methods

  /**
   * Perform user provider server-side authentification.
   * @async
   * @param {string} username
   * @param {string} password
   * @throws {Error}
   * @return {Promise<Object>} Authentication obtained from provider server (token, key, ...)
   */
  async authenticate (username, password) {
    throw new Error (this.#getErrorMessage('authenticate'))
  }

  /**
   * Check and initialize provider instance authentication from credentials obtained (may perform an authentication refresh).
   * @async
   * @param {string} authentication - Authentication obtained from provider server (token, key, ...)
   * @throws {Error}
   * @return {Promise<Object>} Authentication validated
   */
  async setAuthentication (authentication) {
    throw new Error (this.#getErrorMessage('setAuthentication'))
  }

  /**
   * Ask provider backend to remove current authentication.
   * @async
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async logout () {
    throw new Error (this.#getErrorMessage('logout'))
  }

  /**
   * Return all existing roles.
   * @return {string[]} Existing roles
   */
  getAllRoles () {
    throw new Error (this.#getErrorMessage('getAllRoles'))
  }

  /**
   * Return all user roles.
   * @param {string} authentication - Authentication obtained from provider server (token, key, ...)
   * @return {string[]} User roles
   */
  getRoles (authentication) {
    throw new Error (this.#getErrorMessage('getRoles'))
  }

  /**
   * Return user identifier.
   * @param {string} authentication - Authentication obtained from provider server (token, key, ...)
   * @return {string} User identifier
   */
  getUserId (authentication) {
    throw new Error (this.#getErrorMessage('getUserId'))
  }

  /**
   * Start events subscription throught provider backend (websocket, polling, ...).
   * Optionally, a refresh of all data may be performed to ensure synchronization according to `forceRefresh`.
   *
   * Receiving an event will invoke related dataStore actions to persist data.
   *
   * When subscription status changes, `appStore.setEventsListenerStatus` is invoked.
   * When subscription uses polling, `appStore.setEventsListenerIsPolling` is invoked.
   * If there is a transition state, `appStore.setEventsListenerOpeningStatus` is invoked.
   * @param {boolean} resetCounter - Set `true` to reset the retry counter (open a new connection after user click)
   * @param {boolean} forceRefresh - Set `true` to perform a data refresh before open listener
   */
  openEventsListener (resetCounter, forceRefresh = false) {
    throw new Error (this.#getErrorMessage('openEventsListener'))
  }

  /**
   * Close events subscription.
   */
  closeEventsListener () {
    throw new Error (this.#getErrorMessage('closeEventsListener'))
  }

  /**
   * Check if provider handleOpenIDC Connect
   */
  async hasOidc () {
    throw new Error (this.#getErrorMessage('hasOidc'))
  }

  /**
   * Initiates the OpenIDC Connect authorization request
   */
  async oidcAuthorize () {
    throw new Error (this.#getErrorMessage('oidcAuthorize'))
  }

  /**
   * Provide OpenIDC Connect information to authenticate with the provider
   * @param {string} state
   * @param {string} redirectUrl
   */
  async oidcCallback (state, redirectUrl) {
    throw new Error (this.#getErrorMessage('oidcCallback'))
  }

  /**
   * Request all rooms.
   * @async
   * @param {boolean} isIncludingEquipments - Set `true` to request room equipments
   * @param {boolean} isIncludingSummary - Set `true` to request room summary
   * @return {Promise<Object[]>} Rooms
   */
  async getRooms (isIncludingEquipments, isIncludingSummary) {
    throw new Error (this.#getErrorMessage('getRooms'))
  }

  /**
   * Request a room by its `id`.
   * @async
   * @param {string} roomId
   * @param {boolean} isIncludingSummaryStates - Set `true` to request room summary
   * @throws {Error}
   * @return {Promise<Object>} Room
   */
  async getRoom (roomId, isIncludingSummaryStates) {
    throw new Error (this.#getErrorMessage('getRoom'))
  }

  /**
   * Create a new room.
   * @async
   * @param {Object} room
   * @throws {Error}
   * @return {Promise<Object>} The created room
   */
  async createRoom (room) {
    throw new Error (this.#getErrorMessage('createRoom'))
  }

  /**
   * Update a room.
   * @async
   * @param {Object} room
   * @throws {Error}
   * @return {Promise<Object>} The updated room
   */
  async updateRoom (room) {
    throw new Error (this.#getErrorMessage('updateRoom'))
  }

  /**
   * Delete a room by its `id`.
   * @async
   * @param {string} roomId
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async deleteRoom (roomId) {
    throw new Error (this.#getErrorMessage('deleteRoom'))
  }

  /**
   * Request global summary.
   * @async
   * @throws {Error}
   * @return {Promise<Object>} Global summary
   */
  async getSummary () {
    throw new Error (this.#getErrorMessage('getSummary'))
  }

  /**
   * Request a specific room summary by its `roomId` and `key`.
   * @async
   * @param {string} roomId
   * @param {string} key
   * @throws {Error}
   * @return {Promise<string|number>} Summary value
   */
  async getRoomSummary (roomId, key) {
    throw new Error (this.#getErrorMessage('getRoomSummary'))
  }

  /**
   * Request all equipments.
   * @async
   * @param {boolean} isIncludingActions - Set `true` to request equipment actions
   * @param {boolean} isIncludingStates - Set `true` to request equipment states
   * @throws {Error}
   * @return {Promise<Object[]>} Equipments
   */
  async getEquipments (isIncludingActions, isIncludingStates) {
    throw new Error (this.#getErrorMessage('getEquipments'))
  }

  /**
   * Request an equipment by its `id`.
   * @async
   * @param {string} equipmentId
   * @throws {Error}
   * @return {Promise<Object>} Equipment
   */
  async getEquipment (equipmentId) {
    throw new Error (this.#getErrorMessage('getEquipment'))
  }

  /**
   * Create a new equipment.
   * @async
   * @param {Object} equipment
   * @throws {Error}
   * @return {Promise<Object>} The created equipment
   */
  async createEquipment (equipment) {
    throw new Error (this.#getErrorMessage('createEquipment'))
  }

  /**
   * Update an equipment.
   * @async
   * @param {Object} equipment
   * @throws {Error}
   * @return {Promise<Object>} The updated room
   */
  async updateEquipment (equipment) {
    throw new Error (this.#getErrorMessage('updateEquipment'))
  }

  /**
   * Delete an equipment by its `id`.
   * @async
   * @param {string} equipmentId
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async deleteEquipment (equipmentId) {
    throw new Error (this.#getErrorMessage('deleteEquipment'))
  }

  /**
   * Request all states.
   * @async
   * @throws {Error}
   * @return {Promise<Object[]>} States
   */
  async getStates (isIncludingActions, isIncludingStates) {
    throw new Error (this.#getErrorMessage('getStates'))
  }

  /**
   * Request a state by its `id`.
   * @async
   * @param {string} stateId
   * @throws {Error}
   * @return {Promise<Object>} State
   */
  async getState (stateId) {
    throw new Error (this.#getErrorMessage('getState'))
  }

  /**
   * Create a new state.
   * @async
   * @param {Object} state
   * @throws {Error}
   * @return {Promise<Object>} The created state
   */
  async createState (state) {
    throw new Error (this.#getErrorMessage('createState'))
  }

  /**
   * Update a state.
   * @async
   * @param {Object} state
   * @throws {Error}
   * @return {Promise<Object>} The updated state
   */
  async updateState (state) {
    throw new Error (this.#getErrorMessage('updateState'))
  }

  /**
   * Delete a state by its `id`.
   * @async
   * @param {string} stateId
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async deleteState (stateId) {
    throw new Error (this.#getErrorMessage('deleteState'))
  }

  /**
   * Request all actions.
   * @async
   * @throws {Error}
   * @return {Promise<Object[]>} Actions
   */
  async getActions () {
    throw new Error (this.#getErrorMessage('getActions'))
  }

  /**
   * Request an action by its `id`.
   * @async
   * @param {string} actionId
   * @throws {Error}
   * @return {Promise<Object>} Action
   */
  async getAction (actionId) {
    throw new Error (this.#getErrorMessage('getAction'))
  }

  /**
   * Create a new action.
   * @async
   * @param {Object} action
   * @throws {Error}
   * @return {Promise<Object>} The created action
   */
  async createAction (action) {
    throw new Error (this.#getErrorMessage('createAction'))
  }

  /**
   * Update an action.
   * @async
   * @param {Object} action
   * @throws {Error}
   * @return {Promise<Object>} The updated action
   */
  async updateAction (action) {
    throw new Error (this.#getErrorMessage('updateAction'))
  }

  /**
   * Delete an action by its `id`.
   * @async
   * @param {string} actionId
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async deleteAction (actionId) {
    throw new Error (this.#getErrorMessage('deleteAction'))
  }

  /**
   * Request all users.
   * @async
   * @throws {Error}
   * @return {Promise<Object[]>} Users
   */
  async getUsers () {
    throw new Error (this.#getErrorMessage('getUsers'))
  }

  /**
   * Request an user by its `id`.
   * @async
   * @param {string} userId
   * @throws {Error}
   * @return {Promise<Object>} User
   */
  async getUser (userId) {
    throw new Error (this.#getErrorMessage('getUser'))
  }

  /**
   * Create a new user.
   * @async
   * @param {Object} user
   * @throws {Error}
   * @return {Promise<Object>} The created user
   */
  async createUser (user) {
    throw new Error (this.#getErrorMessage('createUser'))
  }

  /**
   * Update an user.
   * @async
   * @param {Object} user
   * @throws {Error}
   * @return {Promise<Object>} The updated user
   */
  async updateUser (user) {
    throw new Error (this.#getErrorMessage('updateUser'))
  }

  /**
   * Update an user avatar.
   * @async
   * @param {string} userId
   * @param {File} file
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async uploadUserAvatar (userId, file) {
    throw new Error (this.#getErrorMessage('uploadUserAvatar'))
  }

  /**
   * Delete an user by its `id`.
   * @async
   * @param {string} userId
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async deleteUser (userId) {
    throw new Error (this.#getErrorMessage('deleteUser'))
  }

  /**
   * Get user tokens.
   * @async
   * @param {string} userId
   * @throws {Error}
   * @return {Promise<Object>} User tokens
   */
  async getUserTokens (userId) {
    throw new Error (this.#getErrorMessage('getUserTokens'))
  }

  /**
   * Delete an user token by its `id`.
   * @async
   * @param {string} userId
   * @param {string} tokenId
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async deleteUserToken (userId, tokenId) {
    throw new Error (this.#getErrorMessage('deleteUserToken'))
  }

  /**
   * Request a new user token.
   * @async
   * @param {string} userId
   * @throws {Error}
   * @return {Promise<Object>} User token
   */
  async requestUserRefreshToken (userId) {
    throw new Error (this.#getErrorMessage('requestUserRefreshToken'))
  }

  /**
   * Get current user profile.
   * @async
   * @throws {Error}
   * @return {Promise<Object>} Current user profile
   */
  async getMyProfile () {
    throw new Error (this.#getErrorMessage('getMyProfile'))
  }

  /**
   * Update current user profile without password.
   * @async
   * @param {Object} user
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async updateMyProfile (user) {
    throw new Error (this.#getErrorMessage('updateMyProfile'))
  }

  /**
   * Update current user password.
   * @async
   * @param {string} password
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async updateMyPassword (user) {
    throw new Error (this.#getErrorMessage('updateMyPassword'))
  }

  /**
   * Get current user tokens.
   * @async
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async getMyTokens () {
    throw new Error (this.#getErrorMessage('getMyTokens'))
  }

  /**
   * Delete a token by its `id` for current user.
   * @async
   * @param {string} tokenId
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async deleteMyToken (tokenId) {
    throw new Error (this.#getErrorMessage('deleteMyToken'))
  }

  /**
   * Update an avatar for current user.
   * @async
   * @param {File} file
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async uploadMyAvatar (file) {
    throw new Error (this.#getErrorMessage('uploadMyAvatar'))
  }

  /**
   * Get provider specific browser list (if provider has a mobile application with custom User-Agent, which should include the provider name for displaying valid icon).
   * @return {Object[]} Browsers list
   */
  async getBrowsersList () {
    console.warn(this.#getErrorMessage('getBrowsersList'))
    return []
  }

  /**
   * Execute an action by its `id` with provided parameters
   * @async
   * @param {string} actionId
   * @param {Object} params
   * @throws {Error}
   * @return {Promise<Object>} Action result
   */
  async executeAction (actionId, params = {}) {
    throw new Error (this.#getErrorMessage('executeAction'))
  }

  /**
   * Request all scenarios.
   * @async
   * @throws {Error}
   * @return {Promise<Object[]>} Scenarios
   */
  async getScenarios () {
    throw new Error (this.#getErrorMessage('getScenarios'))
  }

  /**
   * Change scenario status.
   * @async
   * @param {string} scenarioId
   * @param {string} status Should be in [run, stop, enable, disable].
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async changeScenarioState (scenarioId, status) {
    throw new Error (this.#getErrorMessage('changeScenarioState'))
  }

  /**
   * Request a scenario by its `id`.
   * @async
   * @param {string} scenarioId
   * @throws {Error}
   * @return {Promise<Object>} Scenario
   */
  async getScenario (scenarioId) {
    throw new Error (this.#getErrorMessage('getScenario'))
  }

  /**
   * Create a new scenario.
   * @async
   * @param {Object} scenario
   * @throws {Error}
   * @return {Promise<Object>} The created scenario
   */
  async createScenario (scenario) {
    throw new Error (this.#getErrorMessage('createScenario'))
  }

  /**
   * Update a scenario.
   * @async
   * @param {Object} scenario
   * @throws {Error}
   * @return {Promise<Object>} The updated scenario
   */
  async updateScenario (scenario) {
    throw new Error (this.#getErrorMessage('updateScenario'))
  }

  /**
   * Delete a scenario by its `id`.
   * @async
   * @param {string} scenarioId
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async deleteScenario (scenarioId) {
    throw new Error (this.#getErrorMessage('deleteScenario'))
  }

  /**
   * Request all intents.
   * @async
   * @throws {Error}
   * @return {Promise<Object[]>} Intents
   */
  async getIntents () {
    throw new Error (this.#getErrorMessage('getIntents'))
  }

  /**
   * Request an intent by its `id`.
   * @async
   * @param {string} intentId
   * @throws {Error}
   * @return {Promise<Object>} Intent
   */
  async getIntent (intentId) {
    throw new Error (this.#getErrorMessage('getIntent'))
  }

  /**
   * Create a new intent.
   * @async
   * @param {Object} intent
   * @throws {Error}
   * @return {Promise<Object>} The created intent
   */
  async createIntent (intent) {
    throw new Error (this.#getErrorMessage('createIntent'))
  }

  /**
   * Update an intent.
   * @async
   * @param {Object} intent
   * @throws {Error}
   * @return {Promise<Object>} The updated intent
   */
  async updateIntent (intent) {
    throw new Error (this.#getErrorMessage('updateIntent'))
  }

  /**
   * Delete an intent by its `id`.
   * @async
   * @param {string} intentId
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async deleteIntent (intentId) {
    throw new Error (this.#getErrorMessage('deleteIntent'))
  }

  /**
   * Request possible actions for an intention (used in options select).
   * @async
   * @return {Promise<Object>} Result
   */
  async getIntentActions () {
    throw new Error (this.#getErrorMessage('getIntentActions'))
  }

  /**
   * Request all entities.
   * @async
   * @throws {Error}
   * @return {Promise<Object[]>} Entities
   */
  async getEntities () {
    throw new Error (this.#getErrorMessage('getEntities'))
  }

  /**
   * Request an entity by its `id`.
   * @async
   * @param {string} entityId
   * @throws {Error}
   * @return {Promise<Object>} Entity
   */
  async getEntity (entityId) {
    throw new Error (this.#getErrorMessage('getEntity'))
  }

  /**
   * Create a new entity.
   * @async
   * @param {Object} entity
   * @throws {Error}
   * @return {Promise<Object>} The created entity
   */
  async createEntity (entity) {
    throw new Error (this.#getErrorMessage('createEntity'))
  }

  /**
   * Update an entity.
   * @async
   * @param {Object} entity
   * @throws {Error}
   * @return {Promise<Object>} The updated entity
   */
  async updateEntity (entity) {
    throw new Error (this.#getErrorMessage('updateEntity'))
  }

  /**
   * Delete an entity by its `id`.
   * @async
   * @param {string} entityId
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async deleteEntity (entityId) {
    throw new Error (this.#getErrorMessage('deleteEntity'))
  }

  /**
   * Train the NLP engine.
   * @async
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async trainNlp (entityId) {
    throw new Error (this.#getErrorMessage('trainNlp'))
  }

  /**
   * Process a NLP utterance.
   * @async
   * @param {string} utterance
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async processNlp (utterance) {
    throw new Error (this.#getErrorMessage('processNlp'))
  }

  /**
   * Use NLP to process an utterance.
   * @async
   * @param {string} utterance
   * @throws {Error}
   * @return {Promise<Object>} Response
   */
  async askQuestion (utterance) {
    throw new Error (this.#getErrorMessage('askQuestion'))
  }

  /**
   * Request all NLP defined utterances.
   * @async
   * @throws {Error}
   * @return {Promise<string[]>} Possible utterances
   */
  async getSentences () {
    throw new Error (this.#getErrorMessage('getSentences'))
  }

  /**
   * Request all communication channels.
   * @async
   * @throws {Error}
   * @return {Promise<Object[]>} Communication channels
   */
  async getChannels () {
    throw new Error (this.#getErrorMessage('getChannels'))
  }

  /**
   * Request a communication channel by its `id`.
   * @async
   * @param {string} channelId
   * @throws {Error}
   * @return {Promise<Object>} Communication channel
   */
  async getChannel (channelId) {
    throw new Error (this.#getErrorMessage('getChannel'))
  }

  /**
   * Create a new communication channel.
   * @async
   * @param {Object} channel
   * @throws {Error}
   * @return {Promise<Object>} The created communication channel
   */
  async createChannel (channel) {
    throw new Error (this.#getErrorMessage('createChannel'))
  }

  /**
   * Update a communication channel.
   * @async
   * @param {Object} channel
   * @throws {Error}
   * @return {Promise<Object>} The updated communication channel
   */
  async updateChannel (channel) {
    throw new Error (this.#getErrorMessage('updateChannel'))
  }

  /**
   * Delete a communication channel by its `id`.
   * @async
   * @param {string} channelId
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async deleteChannel (channelId) {
    throw new Error (this.#getErrorMessage('deleteChannel'))
  }

  /**
   * Request state statistics by its `id`.
   * @async
   * @param {string} stateId
   * @param {Date} from - Start date of data for statistics calculation
   * @param {Date} until - End date of data for statistics calculation
   * @throws {Error}
   * @return {Promise<Object>} State statistics (`{ min, max, avg, trend }`)
   */
  async getStatistics (stateId, from, until) {
    throw new Error (this.#getErrorMessage('getStatistics'))
  }

  /**
   * Request the history of a state by its `id`.
   * @async
   * @param {string} stateId
   * @param {Date} from - Start date of data for history
   * @param {Date} until - End date of data for history
   * @throws {Error}
   * @return {Promise<Object[]>} History of state values (`[{ date, value }]`)
   */
  async getHistory (stateId, from, until) {
    throw new Error (this.#getErrorMessage('getHistory'))
  }

  /**
   * Request all user views.
   * @async
   * @throws {Error}
   * @return {Promise<Object[]>} User views
   */
  async getUserViews () {
    throw new Error (this.#getErrorMessage('getUserViews'))
  }

  /**
   * Request a user view by its `id`.
   * @async
   * @param {string} viewId
   * @throws {Error}
   * @return {Promise<Object>} User view
   */
  async getUserView (viewId) {
    throw new Error (this.#getErrorMessage('getUserView'))
  }

  /**
   * Create a new user view.
   * @async
   * @param {Object} userView
   * @throws {Error}
   * @return {Promise<Object>} The created user view
   */
  async createUserView (userView) {
    throw new Error (this.#getErrorMessage('createUserView'))
  }

  /**
   * Update a user view.
   * @async
   * @param {Object} userView
   * @throws {Error}
   * @return {Promise<Object>} The updated user view
   */
  async updateUserView (userView) {
    throw new Error (this.#getErrorMessage('updateUserView'))
  }

  /**
   * Delete a user view by its `id`.
   * @async
   * @param {string} viewId
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async deleteUserView (viewId) {
    throw new Error (this.#getErrorMessage('deleteUserView'))
  }

  /**
   * Request system logs.
   * @async
   * @param {Object} query - `{ level, service, limit, from, until, text }`
   * @throws {Error}
   * @return {Promise<Object[]>} Logs `[{ message, level, service, timestamp, ... }]`
   */
  async getLogs (query) {
    throw new Error (this.#getErrorMessage('getLogs'))
  }

  /**
   * Request system loggers log level.
   * @async
   * @throws {Error}
   * @return {Promise<Object[]>} Loggers level `[{ logger, level }]`
   */
  async getLoggersLevel () {
    throw new Error (this.#getErrorMessage('getLoggersLevel'))
  }

  /**
   * Set a system loggers log level.
   * @async
   * @param {Object} loggerLevel
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async setLoggerLevel (loggerLevel) {
    throw new Error (this.#getErrorMessage('setLoggerLevel'))
  }

  /**
   * Request system scheduled tasks.
   * @async
   * @param {Object} query
   * @throws {Error}
   * @return {Promise<Object[]>} Jobs `[{ id, message, name, isRunning, cronTime, lastDate, nextDate }]`
   */
  async getJobs (query) {
    throw new Error (this.#getErrorMessage('getJobs'))
  }

  /**
   * Restart system tasks scheduler.
   * @async
   * @param {Object} query
   * @throws {Error}
   * @return {Promise<Object[]>} Jobs `[{ id, message, name, isRunning, cronTime, lastDate, nextDate }]`
   */
  async restartJobs (query) {
    throw new Error (this.#getErrorMessage('restartJobs'))
  }

  /**
   * Request database collections.
   * @async
   * @throws {Error}
   * @return {Promise<Object[]>} Collections `[{ name, stats }]`
   */
  async getDatabaseCollections () {
    throw new Error (this.#getErrorMessage('getDatabaseCollections'))
  }

  /**
   * Download database collections (all or only the ones selected in `params.collections`) backup in JSON or BSON format.
   * @async
   * @param {Object} params - `{ collections, isJson }`
   * @throws {Error}
   * @return {Promise<Object>} Result
   */
  async getDatabaseBackup (params) {
    throw new Error (this.#getErrorMessage('getDatabaseBackup'))
  }

  /**
   * Upload and import database backup in BSON format.
   * @async
   * @param {File} file
   * @throws {Error}
   * @return {Promise<Object[]>} Restore result by collections `[{ name, count }]`
   */
  async importDatabaseBackup (params) {
    throw new Error (this.#getErrorMessage('importDatabaseBackup'))
  }

  /**
   * Request system metrics (CPU, memory, disk, containers).
   * @async
   * @throws {Error}
   * @return {Promise<Object>} Metrics `{ load, cpuCores, disk, memory, containers }`
   */
  async getSystemMetrics () {
    throw new Error (this.#getErrorMessage('getSystemMetrics'))
  }

  /**
   * Request system health checks (global, database, events, database connections, pub/sub connections).
   * @async
   * @throws {Error}
   * @return {Promise<Object>} Health `{ healthy, components, dbConnections, eventsConnections }`
   */
  async getSystemHealth () {
    throw new Error (this.#getErrorMessage('getSystemHealth'))
  }

  /**
   * Request system links (monitoring, ...).
   * @async
   * @throws {Error}
   * @return {Promise<Object[]>} Links `[{ name, links: [{ name, icon, url, description }] }]`
   */
  async getSystemLinks () {
    console.warn(this.#getErrorMessage('getSystemLinks'))
    return []
  }

  /**
   * Request all system notifications.
   * @async
   * @throws {Error}
   * @return {Promise<Object[]>} `[{ id, date, source, message, level }]`
   */
  async getNotifications () {
    throw new Error (this.#getErrorMessage('getNotifications'))
  }

  /**
   * Delete all system notifications.
   * @async
   * @throws {Error}
   */
  async clearNotifications () {
    throw new Error (this.#getErrorMessage('clearNotifications'))
  }

  /**
   * Request actions recorded.
   * @async
   * @param {Object} query
   * @throws {Error}
   * @return {Promise<Object[]>} Recorded actions `[{ id, userId, userName, channel, actionId, params, date }]`
   */
  async getActionsRecords (query) {
    throw new Error (this.#getErrorMessage('getActionsRecords'))
  }

  /**
   * Request an user's avatar URL.
   * @async
   * @param {string} userId
   * @throws {Error}
   * @return {Promise<String>} User's avatar URL
   */
  async getAvatarUri (userId) {
    throw new Error (this.#getErrorMessage('getAvatarUri'))
  }

  /**
   * Retrieve the objects linked to a specific object (defined by its `id` and `type`).
   * @async
   * @param {string} type - Current object type (room, equipment, ...)
   * @param {string} id - Current object identifier
   * @throws {Error}
   * @return {Promise<Object>} Objects linked
   */
  async getLinks (type, id) {
    throw new Error (this.#getErrorMessage('getLinks'))
  }
}
