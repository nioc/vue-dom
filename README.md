# ![](/docs/icon.png) Vue-dom

[![license: AGPLv3](https://img.shields.io/badge/license-AGPLv3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![GitHub release](https://img.shields.io/github/release/nioc/vue-dom.svg)](https://github.com/nioc/vue-dom/releases/latest)
[![Build Status](https://travis-ci.org/nioc/vue-dom.svg?branch=master)](https://travis-ci.org/nioc/vue-dom)

Vue-dom is a web front end for home automation software (currently only support [Jeedom](https://www.jeedom.com)).

## Key features
-    display rooms with summary,
-    display room with logical equipments,
-    display logical equipments by tags,
-    display info statistics (min, average and max) and history chart,
-    display and start scenarios,
-    display system notifications,
-    ask query (interaction),
-    user authentication with login and password (not stored in application),
-    communicate with your back-end software through JSON-RPC API and [websocket](https://github.com/nioc/jeedom-websocket), authorized with user API key,
-    reduce data traffic,
-    responsive,
-    progressive web app (offline access).

Check out the [live demo](https://nioc.github.io/vue-dom/) (since using mock data, there is no effective action and inconsistencies may occur).

## Installation

For basic use, you just have to:
-    download [latest release](https://github.com/nioc/vue-dom/releases/latest) tar.gz archive,
-    unarchive in `/var/www/vue-dom/`,
-    add following lines in Apache virtual hosts `/etc/apache2/sites-enabled/default-ssl.conf` and `/etc/apache2/sites-enabled/000-default.conf`, inside `<VirtualHost>` section:
      ``` conf
              alias /vue-dom/ /var/www/vue-dom/
              <Directory /var/www/vue-dom>
                      Options -Indexes -FollowSymLinks -MultiViews -ExecCGI
                      AllowOverride none
                      Order allow,deny
                      allow from all
              </Directory>
      ```
-   set your back end (Jeedom) url in `/var/www/vue-dom/local.js`.

If you are using Docker, you can download the [Dockerfile](/docker/Dockerfile) and build image with your own url:
```
docker build \
-f Dockerfile \
-t nioc/vue-dom:nginx-alpine-latest \
--build-arg JSON_RPC_API_URL=https://192.168.1.50/core/api/jeeApi.php \
--build-arg WEBSOCKET_URL=wss://192.168.1.50/socket/ .
```

And then run application in container:
```
docker run -d -p 80:80 --rm --name vue-dom-1 nioc/vue-dom:nginx-alpine-latest
```

For more advanced use (adding your own component, style, ...), you have to follow the [contributing guide](CONTRIBUTING.md) and edit Vue code.

## Versioning

Vue-dom is maintained under the [semantic versioning](https://semver.org/) guidelines.

See the [releases](https://github.com/nioc/vue-dom/releases) on this repository for changelog.

## Contributing

If you have a suggestion for a feature you think would enhance this product, please submit a [feature request](https://github.com/nioc/vue-dom/issues/new?labels=enhancement&template=feature_request.md).
Pull requests are welcomed. See [contributing](CONTRIBUTING.md).

## Credits

* **[Nioc](https://github.com/nioc/)** - *Initial work*

See also the list of [contributors](https://github.com/nioc/vue-dom/contributors) to this project.

This project is powered by the following components:
- [VueJS](https://vuejs.org/) (MIT)
- [Bulma](https://bulma.io/) (MIT)
- [Buefy](https://buefy.github.io) (MIT)
- [Font Awesome](https://github.com/FortAwesome/Font-Awesome/) (Font Awesome Free License)
- [axios](https://github.com/axios/axios ) (MIT)
- [normalizr](https://github.com/paularmstrong/normalizr) (MIT)
- [Chart.js](https://www.chartjs.org/) (MIT)
- [vue-chartjs](https://vue-chartjs.org/) (MIT)
- [vuex-persist](https://github.com/championswimmer/vuex-persist) (MIT)
- [Moment.js](https://momentjs.com/) (MIT)
- [vue-moment](https://github.com/brockpetrie/vue-moment) (MIT)

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE.md) file for details
