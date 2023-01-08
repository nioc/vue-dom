<template>
  <o-collapse class="card mb-4" animation="slide" aria-id="logsContent" :open="false" @open="load">
    <template #trigger="props">
      <header class="card-header" role="button" aria-controls="logsContent" :aria-expanded="props.open">
        <p class="card-header-title">
          <span class="icon"><i class="fa fa-clipboard-list" /></span><span>Logs</span>
        </p>
        <a class="card-header-icon">
          <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
        </a>
      </header>
    </template>
    <section class="card-content is-relative">
      <o-loading v-model:active="isLoading" :full-page="false" />
      <div class="field is-horizontal">
        <div class="field-body">

          <div class="field is-narrow">
            <div class="control">
              <div class="select">
                <select v-model="search.service" title="Service(s)" @change="getLogs(true, false)">
                  <option value="core">Core</option>
                  <option value="nlp">NLP</option>
                  <option value="node-red">Node-red</option>
                  <option value="log">Logs</option>
                  <option value="core,nlp,node-red,log">Tous</option>
                </select>
              </div>
            </div>
          </div>

          <div class="field is-narrow">
            <div class="control">
              <div class="select">
                <select v-model="search.level" title="Niveau de verbosité" @change="getLogs(true, false)">
                  <option value="0">Erreur</option>
                  <option value="1">Warning</option>
                  <option value="2">Info</option>
                  <option value="5">Debug</option>
                  <option value="10">Tout</option>
                </select>
              </div>
            </div>
          </div>

          <div class="field is-narrow" title="Date de début">
            <o-datetimepicker v-model="search.startDate" placeholder="Début" editable>
              <template #left>
                <button class="button is-primary" title="Utiliser l'heure courante" @click="search.startDate = new Date()"><i class="fas fa-clock" /></button>
              </template>
              <template #right>
                <button class="button" title="Supprimer le filtre" @click="search.startDate = null"><i class="fas fa-times-circle" /></button>
              </template>
            </o-datetimepicker>
          </div>

          <div class="field is-narrow" title="Date de fin">
            <o-datetimepicker v-model="search.endDate" placeholder="Fin" editable>
              <template #left>
                <button class="button is-primary" title="Utiliser l'heure courante" @click="search.endDate = new Date()"><i class="fas fa-clock" /></button>
              </template>
              <template #right>
                <button class="button" title="Supprimer le filtre" @click="search.endDate = null"><i class="fas fa-times-circle" /></button>
              </template>
            </o-datetimepicker>
          </div>

          <div class="field is-narrow">
            <div class="control">
              <div class="select">
                <select v-model.number="search.limit" title="Nombre de logs" @change="getLogs(true, false)">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                </select>
              </div>
            </div>
          </div>

          <div id="search-logs" class="field">
            <div class="control has-icons-left has-icons-right">
              <input v-model="search.query" class="input" type="text" placeholder="Rechercher un évènement">
              <span class="icon is-small is-left"><i class="fas fa-search" /></span>
              <button v-if="search.query" class="button icon is-ghost is-ghost-danger is-right is-clickable" title="Supprimer la recherche" @click="search.query=''"><i class="fas fa-times-circle" /></button>
            </div>
          </div>

          <div class="field is-narrow is-flex">
            <div class="control is-flex">
              <o-switch v-model="search.isRemoteQuery" size="is-small" class="m-0" :title="`Recherche ${search.isRemoteQuery ? 'sur le serveur' : 'locale'}`"><span class="is-size-6 is-hidden-tablet">Recherche {{ search.isRemoteQuery ? 'sur le serveur' : 'locale' }}</span></o-switch>
            </div>
          </div>

          <div class="field is-narrow">
            <span class="buttons is-flex-wrap-nowrap">
              <button class="button is-primary" title="Rafraichir" @click="getLogs(true, true)">
                <span class="icon"><i class="fa fa-sync-alt" /></span>
              </button>
              <button class="button" title="Copier les logs dans le presse-papier" @click="copyToClipboard">
                <span class="icon"><i class="fa fa-paste" /></span>
              </button>
            </span>
          </div>
        </div>
      </div>

      <o-table ref="LogsTable" v-model:current-page="currentPage" :data="logsFiltered" striped hoverable :mobile-cards="false" :paginated="logsFiltered.length>20" per-page="20" detailed :show-detail-icon="false" :row-class="getLogClass" @click="showLogDetails">
        <o-table-column v-slot="props" field="service" label="">
          <i class="fas fa-fw" :class="props.row.serviceIcon" :title="props.row.service" />
        </o-table-column>
        <o-table-column v-slot="props" field="timestamp" label="Date">
          <time-ago v-if="props.row.timestamp" :date="props.row.timestamp" :drop-fixes="true" :title="props.row.timestamp" />
        </o-table-column>
        <o-table-column v-slot="props" field="level" label="Niveau">
          {{ props.row.level }}
        </o-table-column>
        <o-table-column v-slot="props" field="message" label="Message" cell-class="message-cell">
          {{ props.row.message }}
        </o-table-column>
        <template #detail="props">
          <ul class="is-selectable">
            <li v-for="(value, key) in stripLog(props.row)" :key="key">
              <label class="label">{{ key.charAt(0).toUpperCase() + key.slice(1) }}</label>
              <pre v-if="key==='requestId'" class="is-size-7 message-cell is-selectable-all">{{ value }}<a class="ml-3" title="Rechercher cette requête" @click="search.query=value"><i class="fa fa-search" /></a></pre>
              <pre v-else-if="key==='timestamp'" class="is-size-7 message-cell">{{ value }}<a class="ml-3" title="Rechercher jusqu'à cette date" @click="search.endDate=addDate(value, {seconds: 1})"><i class="fa fa-backward" /></a><a class="ml-3" title="Rechercher à partir de cette date" @click="search.startDate=addDate(value, {seconds: 0})"><i class="fa fa-forward" /></a></pre>
              <pre v-else class="is-size-7 message-cell">{{ value }}</pre>
            </li>
          </ul>
        </template>
      </o-table>

      <div v-for="loggerLevel in loggersLevel" :key="loggerLevel.logger" class="field">
        <label class="label">Verbosité d'enregistrement des logs {{ loggerLevel.logger }}</label>
        <div class="control">
          <div class="select">
            <select v-model="loggerLevel.level" title="Niveau de verbosité" @change="setLoggerLevel(loggerLevel)">
              <option value="error">Erreur</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
              <option value="silly">Trace</option>
            </select>
          </div>
        </div>
      </div>

    </section>

  </o-collapse>
</template>

<script>
import TimeAgo from '@/components/TimeAgo.vue'
import { useAppStore } from '@/store/app'
import { dtFormat, dtParse, dtAdd } from '@/services/Datetime'
import { provider } from '@/services/Provider'

export default {
  name: 'SystemLogs',
  components: {
    TimeAgo,
  },
  setup() {
    const appStore = useAppStore()
    return { appStore }
  },
  data () {
    return {
      search: {
        service: 'core,nlp,node-red,log',
        level: 2,
        limit: 10,
        startDate: null,
        endDate: null,
        query: '',
        isRemoteQuery: false,
      },
      logs: [],
      isLoading: false,
      lastLogsFetch: 0,
      lastLogsRead: 0,
      loggersLevel: [],
      currentPage: 1,
    }
  },
  computed: {
    logsFiltered () {
      if (this.search.query === '') {
        return this.logs
      }
      return this.logs.filter((log) => (
        (typeof log.message === 'string' && log.message.toLowerCase().indexOf(this.search.query.toLowerCase()) > -1) ||
        log.requestId === this.search.query),
      )
    },
  },
  methods: {
    load () {
      this.getLogs(false, true)
      this.getLoggersLevel()
    },
    async getLogs (isRefresh, isManual) {
      if (this.logs.length > 0 && !isRefresh) {
        return
      }
      this.isLoading = true
      if (isManual) {
        this.lastLogsRead = this.lastLogsFetch
      }
      try {
        const query = {
          level: this.search.level,
          service: this.search.service,
          limit: this.search.limit,
        }
        if (this.search.startDate !== null) {
          query.from = dtFormat(this.search.startDate, 'ISO')
        }
        if (this.search.endDate !== null) {
          query.until = dtFormat(this.search.endDate, 'ISO')
        }
        if (this.search.isRemoteQuery) {
          query.text = this.search.query
        }
        this.logs = await provider.getLogs(query)
        this.logs.forEach((log) => {
          log.isNew = dtParse(log.timestamp) > this.lastLogsRead
          switch (log.service) {
            case 'core':
              log.serviceIcon = 'fa-server'
              break
            case 'node-red':
              log.serviceIcon = 'fa-project-diagram'
              break
            case 'nlp':
              log.serviceIcon = 'fa-brain'
              break
            case 'log':
              log.serviceIcon = 'fa-clipboard-list'
              break
            default:
              log.serviceIcon = 'fa-question'
          }
        })
        this.lastLogsFetch = new Date()
        this.currentPage = 1
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async getLoggersLevel () {
      try {
        this.loggersLevel = await provider.getLoggersLevel()
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
    },
    async setLoggerLevel (loggerLevel) {
      this.isLoading = true
      try {
        const updatedLoggerLevel = await provider.setLoggerLevel(loggerLevel)
        this.loggersLevel
          .find((_loggerLevel) => _loggerLevel.logger === loggerLevel.logger)
          .level = updatedLoggerLevel.level
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    showLogDetails (log) {
      this.$refs.LogsTable.toggleDetails(log)
    },
    stripLog (log) {
      const logStriped = Object.assign({}, log)
      delete logStriped.service
      delete logStriped.level
      delete logStriped.isNew
      delete logStriped.serviceIcon
      return logStriped
    },
    getLogClass (log) {
      const classes = [
        'is-clickable',
      ]
      if (log.isNew) {
        classes.push('has-text-weight-bold')
      }
      switch (log.level) {
        case 'error':
          classes.push('has-text-danger-mid-dark')
          break
        case 'warn':
          classes.push('has-text-warning-mid-dark')
          break
        case 'info':
          classes.push('has-text-success-mid-dark')
          break
        case 'debug':
          classes.push('has-text-info-mid-dark')
          break
        case 'silly':
          classes.push('has-text-grey-light')
          break
      }
      return classes.join(' ')
    },
    async copyToClipboard () {
      try {
        const logs = this.logsFiltered
          .map((log) => {
            let txt = ''
            txt = `${log.timestamp} [${log.service}] ${log.level.toUpperCase()} ${log.message}`
            for (const key in log) {
              if (!['isNew', 'timestamp', 'service', 'level', 'message'].includes(key)) {
                let value = log[key]
                if (typeof value !== 'string') {
                  value = JSON.stringify(value)
                }
                txt += `\n${key}: ${value}`
              }
            }
            return txt
          })
          .join('\n\n')
        await navigator.clipboard.writeText(logs)
        this.appStore.setInformation({ type: 'is-success', message: 'Logs copiés dans le presse-papier' })
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la copie des logs : ${error.message}` })
      }
    },
    addDate (date, duration) {
      return dtAdd(date, duration)
    },
  },
}
</script>

<style scoped>
.b-table ::v-deep(.message-cell) {
  line-break: anywhere;
  white-space: pre-wrap;
}
.b-table ::v-deep(td:not(:last-child)){
  white-space: nowrap;
}
.b-table ::v-deep(td:last-child){
  width: 100%;
}
.datepicker {
  max-width: 10em;
}
</style>
