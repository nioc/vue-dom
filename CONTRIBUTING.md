## Contributing

The project is open and any contribution is welcome!

#### Edit frontend (VueJS)

In order to contribute to this VueJS frontend:

0. Install prerequisite:
  - [Node.js](https://nodejs.org/)
  - npm `npm install npm@latest -g`
1. Access the frontend folder in a shell `cd /var/www/vue-dom`
2. Build the project `npm install` and wait for the downloads
3. Start the vite server `npm run dev`
4. Edit the code!

If you are using Docker, you can use the [Dockerfile-dev](/docker/Dockerfile-dev) to avoid installing Node.js on your local computer:
```
docker build \
-f docker/Dockerfile-dev \
-t nioc/vue-dom:node-alpine-dev \
.
```

And then run vue-cli serve in container:
```
docker run -it \
-p 3000:3000 \
--rm \
-v "$(pwd)":/app \
-v "/app/node_modules" \
--name vue-dom-1 \
nioc/vue-dom:node-alpine-dev
```

#### A little how-to for Github

1. [Fork it](https://help.github.com/articles/fork-a-repo/)
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes (with a detailled message): `git commit -am 'Add an awesome feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

#### Adding a new provider

##### 1. Create provider wrapper

You can add your own provider by creating a file in `src/services/providers/` folder.

This file should be named following this pattern `<provider name>Api.js`, for example, creating a wrapper for a software named _Automotic_, filename should be `AutomoticApi.js`.

This file must expose an object with required functions:
- authenticate
- setAuthentication
- getRoles
- openEventsListener
- closeEventsListener
- getRooms
- getSummary
- getRoomSummary
- executeAction
- getScenarios
- changeScenarioState
- getStatistics
- getHistory
- askQuestion
- getSentences
- getNotifications
- clearNotifications

For example:

``` js
const AutomoticApi = function (restApiUrl = null, websocketUrl = null, statisticsPeriod = 86400000) {
  // if you need privates methods, write it before the return

  return {
    async authenticate (login, password) {
      // login to provider with user credentials and return an object that contains the result (API key / JWT / whatever), throw error in case of authentication failed
      return authentication
    },

    setAuthentication (_authentication) {
      // store authentication to provider code (required for restoring session)
      authentication = _authentication
    },

    getRoles () {
      // return user roles as an array, should be read from authentication (scope in JWT) or read from API call
      return ['user', 'admin']
    },

    openEventsListener (resetCounter, forceRefresh = false) {
      // suscribe to provider events throught websocket / long polling or whatever provider implements
    },

    closeEventsListener () {
      // close events recuperation (websocket connection or long polling timer)
    },

    async getRooms () {
      // get rooms, adapt format and return array, can throw errors
      return [{}]
    },

    async getSummary () {
      // request and return global summary, can throw errors
      return [{}]
    },

    async getRoomSummary (roomId, key) {
      // request and return room summary, can throw errors
      return [{}]
    },

    async executeAction (actionId, options) {
      // execute a command with prodivded options, return result, can throw errors
      return {}
    },

    async getScenarios () {
      // request all scenarios and returns only visible ones, can throw errors
      return [{}]
    },

    async changeScenarioState (id, state) {
      // change scenario state, return result, can throw errors
      return {}
    },

    async getStatistics (stateId, startTime = null, endTime = null) {
      // request state statistics and return min, max and average, can throw errors
      return {min, avg, max}
    },

    async getHistory (stateId, startTime = null, endTime = null) {
      // request state history and return values/dates array, can throw errors
      return [{date, value}]
    },

    async askQuestion (query, replyAction = null) {
      // try to ask a question, return provider answer, can throw errors
      return {}
    },

    async getSentences () {
      // request and return defined interactions, can throw errors
      return [{}]
    },

    async getNotifications () {
      // request and return system notifications, can throw errors
      return [{}]
    },

    async clearNotifications () {
      // delete system notifications, return result, can throw errors
      return {}
    },
  }
}

export { AutomoticApi }
```

##### 2. Declare provider wrapper

Add your newly created provider in `src/services/Provider.js`:

```js
      case 'automotic': {
        const { AutomoticApi } = await import ('@/services/providers/AutomoticApi')
        provider = AutomoticApi(
          provider.restApiUrl,
          provider.websocketUrl,
          provider.statisticsPeriod,
        )
        break
      }
```

##### 3. Configure Vue-dom for using this provider

Finally, configure `local.js` with your newly created provider:

```js
  provider: {
    system: 'automotic',
    restApiUrl: 'http://localhost/api/',
    websocketUrl: 'ws://localhost/websocket',
    statisticsPeriod: 86400000,
  },
```
