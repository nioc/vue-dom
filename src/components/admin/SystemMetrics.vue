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

      <div v-if="metrics.load" class="field mb-5">
        <div class="control">
          <label class="label">Charge processeur ({{ metrics.cpuCores }} cores)</label>
          <system-metric v-for="load in metrics.load" :key="load.period" :label="`Moyenne sur ${load.period}`" :value="load.value" :max="metrics.cpuCores" />
        </div>
      </div>

      <div v-if="metrics.memory" class="field mb-5">
        <div class="control">
          <label class="label">Mémoire</label>
          <system-metric label="RAM" :human-value="`${getHumanSize(metrics.memory.memFree)} disponible (extensible à ${getHumanSize(metrics.memory.memAvailable)}) sur ${getHumanSize(metrics.memory.memTotal)}`" :value="metrics.memory.memTotal-metrics.memory.memAvailable" :max="metrics.memory.memTotal" />
          <system-metric label="Swap" :human-value="`${getHumanSize(metrics.memory.swapFree)} disponible sur ${getHumanSize(metrics.memory.swapTotal)}`" :value="metrics.memory.swapTotal-metrics.memory.swapFree" :max="metrics.memory.swapTotal" />
        </div>
      </div>

      <div v-if="metrics.disk" class="field mb-5">
        <div class="control">
          <label class="label">Espace disque</label>
          <system-metric v-for="fs in metrics.disk" :key="fs.fs" :label="fs.mount" :label-title="fs.fs" :human-value="`${getHumanSize(fs.available)} disponible sur ${getHumanSize(fs.size)}`" :value="fs.size-fs.available" :max="fs.size" />
        </div>
      </div>

      <div v-if="metrics.date" class="has-text-weight-light is-italic mb-3">Informations collectées <time-ago v-if="metrics.date" :drop-fixes="false" :date="metrics.date" :title="metrics.date | moment('LLL')" /></div>

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

export default {
  name: 'SystemMetrics',
  components: {
    SystemMetric,
    TimeAgo,
  },
  data () {
    return {
      isLoading: false,
      metrics: {
      },
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
      this.isLoading = false
    },
    getHumanSize (size) {
      const humanSize = size * 1024
      if (humanSize > 1000000000) {
        return Math.round(humanSize / Math.pow(2, 30)) + ' Gio'
      }
      if (humanSize > 1000000) {
        return Math.round(humanSize / Math.pow(2, 20)) + ' Mio'
      }
      if (humanSize > 1000) {
        return Math.round(humanSize / Math.pow(2, 10)) + ' Kio'
      }
      return humanSize + ' o'
    },
  },
}
</script>
