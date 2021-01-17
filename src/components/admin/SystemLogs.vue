<template>
  <b-collapse class="card mb-4" animation="slide" aria-id="logsContent" :open="false" @open="getLogs(false, true)">
    <header slot="trigger" slot-scope="props" class="card-header" role="button" aria-controls="logsContent">
      <p class="card-header-title">
        <span class="icon"><i class="fa fa-clipboard-list" /></span><span>Logs</span>
      </p>
      <a class="card-header-icon">
        <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
      </a>
    </header>
    <section class="card-content">
      <b-loading v-model="isLoading" :is-full-page="false" />
      <div class="field is-horizontal">
        <div class="field-body">

          <div class="field is-narrow">
            <div class="control">
              <div class="select">
                <select v-model="search.service" title="Service(s)" @change="getLogs(true, false)">
                  <option value="core">Core</option>
                  <option value="node-red">Node-red</option>
                  <option value="core,node-red">Tous</option>
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

          <div class="field">
            <div class="control has-icons-left">
              <input v-model="search.query" class="input" type="text" placeholder="Rechercher un évènement">
              <span class="icon is-small is-left"><i class="fas fa-search" /></span>
            </div>
          </div>

          <div class="field is-narrow">
            <span class="buttons">
              <button class="button is-primary" title="Rafraichir" @click="getLogs(true, true)">
                <span class="icon"><i class="fa fa-sync-alt" /></span>
              </button>
            </span>
          </div>
        </div>
      </div>

      <b-table ref="LogsTable" :data="logsFiltered" striped hoverable :mobile-cards="false" :paginated="logsFiltered.length>20" per-page="20" detailed :show-detail-icon="false" :row-class="(row) => row.isNew ? 'has-text-weight-bold has-text-info is-clickable' : 'is-clickable'" @click="showLogDetails">
        <b-table-column v-slot="props" field="service" label="">
          <i class="fas fa-fw" :class="props.row.service === 'node-red' ? 'fa-project-diagram' : 'fa-server'" :title="props.row.service" />
        </b-table-column>
        <b-table-column v-slot="props" field="timestamp" label="Date">
          <time-ago v-if="props.row.timestamp" :date="props.row.timestamp" :drop-fixes="true" :title="props.row.timestamp | moment('L LTS')" />
        </b-table-column>
        <b-table-column v-slot="props" field="level" label="Niveau">
          {{ props.row.level }}
        </b-table-column>
        <b-table-column v-slot="props" field="message" label="Message" cell-class="message-cell">
          {{ props.row.message }}
        </b-table-column>
        <template slot="detail" slot-scope="props">
          <ul class="is-selectable">
            <li v-for="(value, key) in stripLog(props.row)" :key="key">
              <label class="label">{{ key.charAt(0).toUpperCase() + key.slice(1) }}</label>
              <pre class="is-size-7 message-cell">{{ value }}</pre>
            </li>
          </ul>
        </template>
      </b-table>
    </section>

  </b-collapse>
</template>

<script>
import TimeAgo from '@/components/TimeAgo'

export default {
  name: 'SystemLogs',
  components: {
    TimeAgo,
  },
  data () {
    return {
      search: {
        service: 'core,node-red',
        level: 2,
        limit: 50,
        query: '',
      },
      logs: [],
      isLoading: false,
      lastLogsFetch: 0,
      lastLogsRead: 0,
    }
  },
  computed: {
    logsFiltered () { return this.logs.filter((log) => log.message.toLowerCase().indexOf(this.search.query.toLowerCase()) > -1) },
  },
  methods: {
    async getLogs (isRefresh, isManual) {
      if (this.logs.length > 0 && !isRefresh) {
        return
      }
      this.isLoading = true
      if (isManual) {
        this.lastLogsRead = this.lastLogsFetch
      }
      try {
        this.logs = await this.$Provider.getLogs({
          level: this.search.level,
          service: this.search.service,
          limit: this.search.limit,
        })
        this.logs.map((log) => { log.isNew = this.$moment(log.timestamp).isAfter(this.lastLogsRead) })
        this.lastLogsFetch = new Date()
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
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
      return logStriped
    },
  },
}
</script>

<style scoped>
.b-table >>> .message-cell {
  line-break: anywhere;
  white-space: pre-wrap;
}
.b-table >>> td:not(:last-child){
  white-space: nowrap;
}
.b-table >>> td:last-child{
  width: 100%;
}
</style>