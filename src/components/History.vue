<template>
  <div>
    <div class="field is-horizontal">
      <div class="field-body">
        <div class="field" title="Date de début">
          <b-datetimepicker v-model="startDate" :max-datetime="today" size="is-small" />
        </div>
        <div class="field" title="Date de fin">
          <b-datetimepicker v-model="endDate" :max-datetime="today" size="is-small" />
        </div>
        <div class="field">
          <button class="button is-primary is-rounded is-small" @click="getHistory"><span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span></button>
        </div>
      </div>
    </div>
    <chart v-if="loaded" :chart-data="history" />
  </div>
</template>

<script>
import Chart from '@/components/Chart'
export default {
  components: {
    Chart,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      startDate: null,
      endDate: null,
      history: null,
      loaded: false,
    }
  },
  computed: {
    today () { return new Date() },
  },
  created () {
    this.endDate = new Date()
    this.startDate = new Date(this.endDate.getTime() - 86400000)
    this.getHistory()
  },
  methods: {
    async getHistory () {
      const history = await this.$JeedomApi.getHistory(this.id, this.startDate, this.endDate)
      this.history = {
        datasets: [
          {
            label: this.name,
            data: history.map((point) => point.value),
          },
        ],
        labels: history.map((point) => this.$moment(point.datetime)),
      }
      this.loaded = true
    },
  },
}
</script>
