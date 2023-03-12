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

You can add your own provider by creating a folder in `src/services/providers/` and adding a `Provider.js` file there.

This folder should be named with the `provider.system` you will set in `local.js`, for example, creating a wrapper for a software named _Automotic_, file should be created as `src/services/providers/Automotic/Provider.js`.

This file must expose a class named `Provider` with required methods:
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
...

You can consult the [`AbstractProvider` class](src/services/providers/AbstractProvider.js) which is documented.

``` js
import { AbstractProvider } from '@/services/providers/AbstractProvider'

class Provider extends AbstractProvider {
  constructor (options = {}) {
    super('Automotic')
    // use the provided options (as an API endpoint or otherwise)
    this.endpoint = options.endpoint
  }

  #myPrivateMethod () {
    // if you need privates methods, write it with a # before the name (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
  }

  async authenticate (login, password) {
    // ...
    return authentication
  }

  // add all required methods...
}

// export the Provider class
export { Provider }
```

##### 2. Configure Vue-dom for using this provider

Configure `local.js` with your newly created provider:

```js
  provider: {
    system: 'Automotic',
    restApiUrl: 'http://localhost/api/',
    websocketUrl: 'ws://localhost/websocket',
    statisticsPeriod: 86400000,
  },
```
