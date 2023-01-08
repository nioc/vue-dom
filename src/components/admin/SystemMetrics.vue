<template>
  <o-collapse class="card mb-4" animation="slide" aria-id="metricsContent" :open="false" @open="getSystemMetrics">
    <template #trigger="props">
      <header class="card-header" role="button" aria-controls="metricsContent" :aria-expanded="props.open">
        <p class="card-header-title">
          <span class="icon"><i class="fa fa-server" /></span><span>Etat du système</span>
        </p>
        <a class="card-header-icon">
          <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
        </a>
      </header>
    </template>

    <section class="card-content is-relative">
      <o-loading v-model:active="isLoading" :full-page="false" />

      <div v-if="health" class="field mb-5">
        <div class="control">
          <label class="label">État de santé</label>
          <div class="mb-3">
            <span class="is-flex is-justify-content-space-between">
              <span title="">Etat global</span>
              <span class="icon"><i class="fa" :class="[health.healthy ? 'fa-check has-text-success' : 'fa-times has-text-danger']" /></span>
            </span>
          </div>
          <div v-for="component in health.components" :key="component.key" class="mb-3">
            <span class="is-flex is-justify-content-space-between">
              <span>{{ component.label }}</span>
              <span class="icon"><i class="fa" :class="[component.status ? 'fa-check has-text-success' : 'fa-times has-text-danger']" /></span>
            </span>
          </div>
        </div>
      </div>

      <div v-if="metrics && metrics.load" class="field mb-5">
        <div class="control">
          <label class="label">Charge processeur ({{ metrics.cpuCores }} cores)</label>
          <system-metric v-for="load in metrics.load" :key="load.period" :label="`Moyenne sur ${load.period}`" :value="load.value" :max="metrics.cpuCores" />
        </div>
      </div>

      <div v-if="metrics && metrics.memory" class="field mb-5">
        <div class="control">
          <label class="label">Mémoire</label>
          <system-metric label="RAM" :human-value="`${getHumanSizeCei(metrics.memory.memFree*1024)} disponible (extensible à ${getHumanSizeCei(metrics.memory.memAvailable*1024)}) sur ${getHumanSizeCei(metrics.memory.memTotal*1024)}`" :value="metrics.memory.memTotal-metrics.memory.memAvailable" :max="metrics.memory.memTotal" />
          <system-metric label="Swap" :human-value="`${getHumanSizeCei(metrics.memory.swapFree*1024)} disponible sur ${getHumanSizeCei(metrics.memory.swapTotal*1024)}`" :value="metrics.memory.swapTotal-metrics.memory.swapFree" :max="metrics.memory.swapTotal" />
        </div>
      </div>

      <div v-if="metrics && metrics.disk" class="field mb-5">
        <div class="control">
          <label class="label">Espace disque</label>
          <system-metric v-for="fs in metrics.disk" :key="fs.fs" :label="fs.mount" :label-title="fs.fs" :human-value="`${getHumanSizeCei(fs.available*1024)} disponible sur ${getHumanSizeCei(fs.size*1024)}`" :value="fs.size-fs.available" :max="fs.size" />
        </div>
      </div>

      <div v-if="health" class="field mb-5">
        <div class="control">
          <label class="label">Connexions à la base de données</label>
          <system-metric :label="`Nombre de connexions actives (${health.dbConnections.active}) / ouvertes (${health.dbConnections.current}) / totales (${health.dbConnections.totalCreated})`" :value="health.dbConnections.active" :max="health.dbConnections.current" />
          <o-table :data="health.dbConnections.clients" striped hoverable :mobile-cards="false" sort-icon="caret-up" :default-sort="['active', 'desc']">
            <o-table-column v-slot="props" field="ip" label="Adresse IP" sortable>
              <span class="is-family-code">{{ props.row.ip }}</span>
            </o-table-column>
            <o-table-column v-slot="props" field="active" label="Connexions actives" sortable numeric position="right">
              {{ props.row.active }}
            </o-table-column>
            <o-table-column v-slot="props" field="current" label="Connexions ouvertes" sortable numeric position="right">
              {{ props.row.current }}
            </o-table-column>
          </o-table>
        </div>
      </div>

      <div v-if="health" class="field mb-5">
        <div class="control">
          <label class="label">Connexions au cache de Pub/Sub</label>
          <div class="columns is-vcentered is-centered">
            <div class="column has-text-centered is-narrow" title="Publishers">
              <div v-for="(publisher, index) in health.eventsConnections.publishers" :key="'pub-'+index" class="mb-3">
                <span>{{ publisher.name }} ({{ publisher.ip }})</span>
              </div>
            </div>
            <div class="column has-text-centered is-narrow mx-5">
              <i class="fas fa-long-arrow-alt-right fa-2x is-hidden-mobile" />
              <i class="fas fa-long-arrow-alt-down fa-2x is-hidden-tablet" />
            </div>
            <div class="column has-text-centered is-narrow" title="Subscribers">
              <div v-for="(subscriber, index) in health.eventsConnections.subscribers" :key="'sub-'+index" class="mb-3">
                <span>{{ subscriber.name }} ({{ subscriber.ip }}) : {{ subscriber.sub }} sub &amp; {{ subscriber.psub }} psub</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="metrics && metrics.containers" class="field mb-5">
        <div class="control">
          <label class="label">Conteneurs Docker</label>
          <o-table :data="metrics.containers" striped hoverable :mobile-cards="false" sort-icon="caret-up" default-sort="name">
            <o-table-column v-slot="props" field="name" label="Nom" sortable>
              <span class="is-family-code">{{ props.row.name }}</span>
            </o-table-column>
            <o-table-column v-slot="props" field="cpu" label="CPU" sortable numeric position="right">
              <span :class="{'has-text-danger': props.row.cpu > cpuThreshold}">{{ props.row.cpu }}%</span>
            </o-table-column>
            <o-table-column v-slot="props" field="memory.percent" label="Mémoire" sortable numeric position="right">
              <span :class="{'has-text-danger': props.row.memory.percent > memThreshold}">{{ props.row.memory.percent }}%</span>
            </o-table-column>
            <o-table-column v-slot="props" field="memory.usage" label="Mémoire (détail)" sortable numeric position="right">
              <span :class="{'has-text-danger': props.row.memory.percent > memThreshold}">{{ getHumanSizeCei(props.row.memory.usage, 'o', 1) }}<span class="has-text-weight-light"> / {{ getHumanSizeCei(props.row.memory.size, 'o', 1) }}</span></span>
            </o-table-column>
            <o-table-column v-slot="props" field="status" label="Statut" sortable :custom-sort="sortContainersByStatus">
              <span :title="props.row.rawStatus" style="white-space: nowrap;">
                <i class="mr-1 fas fa-fw fa-power-off" :class="props.row.isActive ? 'has-text-success' :'has-text-danger'" />
                <span class="has-text-weight-light">{{ props.row.durationHumanized }}</span>
                <i v-if="props.row.healthClass" class="ml-3 fas fa-fw" :class="props.row.healthClass" />
              </span>
            </o-table-column>
          </o-table>
        </div>
      </div>

      <div v-if="metrics && metrics.date" class="has-text-weight-light is-italic mb-3">Informations collectées <time-ago v-if="metrics.date" :drop-fixes="false" :date="metrics.date" title-format="PPPPpp" /></div>

      <span class="buttons">
        <button class="button is-primary" title="Rafraichir l'état" @click="getSystemMetrics">
          <span class="icon"><i class="fa fa-sync-alt" /></span>
          <span>Rafraichir</span>
        </button>
      </span>

    </section>
  </o-collapse>
</template>

<script>
import SystemMetric from '@/components/admin/SystemMetric.vue'
import TimeAgo from '@/components/TimeAgo.vue'
import { useConversions } from '@/composables/useConversions'
import { useAppStore } from '@/store/app'
import { dtFormatDuration, dtSub } from '@/services/Datetime'
import { provider } from '@/services/Provider'

export default {
  name: 'SystemMetrics',
  components: {
    SystemMetric,
    TimeAgo,
  },
  setup() {
    const { getHumanSizeCei } = useConversions()
    const appStore = useAppStore()
    return { getHumanSizeCei, appStore }
  },
  data () {
    return {
      isLoading: false,
      metrics: null,
      health: null,
      memThreshold: 60,
      cpuThreshold: 20,
    }
  },
  methods: {
    async getSystemMetrics () {
      this.isLoading = true
      try {
        const metrics = await provider.getSystemMetrics()
        const now = new Date()
        metrics.containers.forEach(container => {
          container.healthClass = null
          container.statusDate = null
          container.rawStatus = container.status
          if (container.status) {
            // handle status
            if (container.status.indexOf('Up ') === 0) {
              container.isActive = true
              container.status = container.status.replace(/^Up /, '')
            } else if (container.status.indexOf('Exited ') > -1) {
              container.isActive = false
              container.status = container.status.replace(/Exited \(\d+\) (.*)/, '$1')
            }
            // handle healthcheck status
            if (container.status.indexOf('(healthy)') > -1) {
              container.healthClass = 'fa-heartbeat has-text-success'
              container.status = container.status.replace(' (healthy)', '')
            } else if (container.status.indexOf('(unhealthy)') > -1) {
              container.healthClass = 'fa-heartbeat has-text-danger'
              container.status = container.status.replace(' (unhealthy)', '')
            } else if (container.status.indexOf('(health: starting)') > -1) {
              container.healthClass = 'fa-heartbeat has-text-warning-mid-dark'
              container.status = container.status.replace(' (health: starting)', '')
            } else if (container.status.indexOf('(Paused)') > -1) {
              container.healthClass = 'fa-pause has-text-warning-mid-dark'
              container.status = container.status.replace(' (Paused)', '')
            }
            // format duration
            container.status = container.status.replace('About ', '').replace(/^an /, '1 ').replace(/^a /, '1 ')
            try {
              const matches = /(\d+) (\w+)/.exec(container.status)
              if (matches[1] < 2) {
                matches[2] += 's'
              }
              const duration = { [matches[2]]: Number.parseInt(matches[1]) }
              container.statusDate = dtSub(now, duration)
              container.durationHumanized = dtFormatDuration(duration)
            } catch (error) {
              console.warn(`Error on duration for container ${container.name}`, error.message)
            }
          }
        })
        this.metrics = metrics
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      try {
        this.health = await provider.getSystemHealth()
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    sortContainersByStatus (a, b, isAsc) {
      if (a.isActive !== b.isActive) {
        return isAsc ? (a.isActive ? -1 : 1) : a.isActive ? 1 : -1
      }
      return isAsc ? a.statusDate - b.statusDate : b.statusDate - a.statusDate
    },
  },
}
</script>
