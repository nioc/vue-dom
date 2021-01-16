<template>
  <b-collapse class="card mb-4" animation="slide" aria-id="schedulerContent" :open="false" @open="getScheduledJobs(false)">
    <header slot="trigger" slot-scope="props" class="card-header" role="button" aria-controls="schedulerContent">
      <p class="card-header-title">
        <span class="icon"><i class="far fa-calendar-check" /></span><span>Tâches programmées</span>
      </p>
      <a class="card-header-icon">
        <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
      </a>
    </header>

    <section class="card-content">
      <b-loading v-model="isLoading" :is-full-page="false" />

      <b-table ref="scheduledJobsTable" :data="scheduledJobs" striped hoverable :mobile-cards="false" :paginated="scheduledJobs.length>1" per-page="10">
        <b-table-column v-slot="props" field="name" label="Nom">
          {{ props.row.name }}
        </b-table-column>
        <b-table-column v-slot="props" field="cronTime" label="Cron">
          {{ props.row.cronTime }}
        </b-table-column>
        <b-table-column v-slot="props" field="isRunning" label="Statut">
          <span class="icon"><i class="fa" :class="props.row.isRunning ? 'fa-play-circle has-text-success' : 'fa-stop-circle has-text-danger'" /></span>
        </b-table-column>
        <b-table-column v-slot="props" field="lastDate" label="Dernière exécution">
          <time-ago v-if="props.row.lastDate" :date="props.row.lastDate" :drop-fixes="false" :title="props.row.lastDate | moment('L LTS')" />
        </b-table-column>
        <b-table-column v-slot="props" field="nextDate" label="Prochaine exécution">
          <time-ago v-if="props.row.nextDate" :date="props.row.nextDate" :drop-fixes="false" :title="props.row.nextDate | moment('L LTS')" />
        </b-table-column>
      </b-table>

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
  </b-collapse>
</template>

<script>
import TimeAgo from '@/components/TimeAgo'

export default {
  name: 'SystemJobs',
  components: {
    TimeAgo,
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
        this.scheduledJobs = await this.$Provider.getJobs()
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async restartScheduledJobs () {
      this.isLoading = true
      try {
        this.scheduledJobs = await this.$Provider.restartJobs()
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
  },
}
</script>
