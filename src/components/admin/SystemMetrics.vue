<template>
  <b-collapse class="card mb-4" animation="slide" aria-id="metricsContent" :open="false" @open="getSystemMetrics">
    <header slot="trigger" slot-scope="props" class="card-header" role="button" aria-controls="metricsContent">
      <p class="card-header-title">
        <span class="icon"><i class="fa fa-server" /></span><span>Etat du système</span>
      </p>
      <a class="card-header-icon">
        <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
      </a>
    </header>

    <section class="card-content">
      <b-loading v-model="isLoading" :is-full-page="false" />

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

      <div v-if="metrics && metrics.date" class="has-text-weight-light is-italic mb-3">Informations collectées <time-ago v-if="metrics.date" :drop-fixes="false" :date="metrics.date" :title="metrics.date | moment('LLL')" /></div>

      <span class="buttons">
        <button class="button is-primary" title="Rafraichir l'état" @click="getSystemMetrics">
          <span class="icon"><i class="fa fa-sync-alt" /></span>
          <span>Rafraichir</span>
        </button>
      </span>

    </section>
  </b-collapse>
</template>

<script>
import SystemMetric from '@/components/admin/SystemMetric'
import TimeAgo from '@/components/TimeAgo'
import { ConversionMixin } from '@/mixins/Conversion'

export default {
  name: 'SystemMetrics',
  components: {
    SystemMetric,
    TimeAgo,
  },
  mixins: [
    ConversionMixin,
  ],
  data () {
    return {
      isLoading: false,
      metrics: null,
      health: null,
    }
  },
  methods: {
    async getSystemMetrics () {
      this.isLoading = true
      try {
        this.metrics = await this.$Provider.getSystemMetrics()
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      try {
        this.health = await this.$Provider.getSystemHealth()
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
  },
}
</script>
