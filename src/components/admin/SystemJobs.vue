<template>
  <o-collapse class="card mb-4" animation="slide" aria-id="schedulerContent" :open="false" @open="getScheduledJobs(false)">
    <template #trigger="props">
      <header class="card-header" role="button" aria-controls="schedulerContent" :aria-expanded="props.open">
        <p class="card-header-title">
          <span class="icon"><i class="far fa-calendar-check" /></span><span>Tâches programmées</span>
        </p>
        <a class="card-header-icon">
          <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
        </a>
      </header>
    </template>

    <section class="card-content is-relative">
      <o-loading v-model:active="isLoading" :full-page="false" />

      <o-table ref="scheduledJobsTable" :data="scheduledJobs" striped hoverable :mobile-cards="false" :paginated="scheduledJobs.length>10" :per-page="10">
        <o-table-column v-slot="props" field="name" label="Nom">
          {{ props.row.name }}
        </o-table-column>
        <o-table-column v-slot="props" field="cronTime" label="Cron">
          {{ getHumanCronTime(props.row.cronTime) }}
        </o-table-column>
        <o-table-column v-slot="props" field="isRunning" label="Statut" position="centered">
          <span class="icon"><i class="fa" :class="props.row.isRunning ? 'fa-play-circle has-text-success' : 'fa-stop-circle has-text-danger'" /></span>
        </o-table-column>
        <o-table-column v-slot="props" field="lastDate" label="Dernière exécution">
          <time-ago v-if="props.row.lastDate" :date="props.row.lastDate" :drop-fixes="false" title-format="PPPPpp" />
        </o-table-column>
        <o-table-column v-slot="props" field="nextDate" label="Prochaine exécution">
          <time-ago v-if="props.row.nextDate" :date="props.row.nextDate" :drop-fixes="false" title-format="PPPPpp" />
        </o-table-column>
      </o-table>

      <span class="buttons">
        <button class="button is-primary" title="Rafraichir les tâches" @click="getScheduledJobs(true)">
          <span class="icon"><i class="fa fa-sync-alt" /></span>
          <span>Rafraichir</span>
        </button>
        <button class="button is-warning" title="Relancer l'ordonnanceur" @click="restartScheduledJobs">
          <span class="icon"><i class="fa fa-redo-alt" /></span>
          <span>Relancer</span>
        </button>
      </span>
    </section>
  </o-collapse>
</template>

<script>
import TimeAgo from '@/components/TimeAgo.vue'
import { useAppStore } from '@/store/app'
import { useConversions } from '@/composables/useConversions'
import { provider } from '@/services/Provider'

export default {
  name: 'SystemJobs',
  components: {
    TimeAgo,
  },
  setup() {
    const appStore = useAppStore()
    const { getHumanCronTime } = useConversions()
    return { appStore, getHumanCronTime }
  },
  data () {
    return {
      scheduledJobs: [],
      isLoading: false,
    }
  },
  methods: {
    async getScheduledJobs (isRefresh) {
      if (this.scheduledJobs.length > 0 && !isRefresh) {
        return
      }
      this.isLoading = true
      try {
        this.scheduledJobs.map(job => {
          job.lastDate = null
          job.nextDate = null
          return job
        })
        this.scheduledJobs = await provider.getJobs()
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async restartScheduledJobs () {
      this.isLoading = true
      try {
        this.scheduledJobs = await provider.restartJobs()
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
  },
}
</script>
