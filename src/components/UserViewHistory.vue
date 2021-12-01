<template>
  <b-collapse class="card mb-4" animation="slide" :aria-id="'history-'+card.title" :open="false" @open="displayHistory(card)" @close="isLoaded=false">
    <header slot="trigger" slot-scope="props" class="card-header" role="button" :aria-controls="'history-'+card.title">
      <p class="card-header-title">
        <span>{{ card.title }}</span>
      </p>
      <a class="card-header-icon">
        <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
      </a>
    </header>
    <div class="card-content">
      <history v-if="isLoaded" :series="series" />
    </div>
  </b-collapse>

</template>

<script>
import History from '@/components/History'

export default {
  name: 'UserViewHistory',
  components: {
    History,
  },
  props: {
    card: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      isLoaded: false,
      series: [],
    }
  },
  methods: {
    displayHistory (card) {
      this.series = []
      card.elements.forEach((element) => {
        this.series.push({
          id: element.id,
          name: element.label,
          dataType: element.dataType,
          borderColor: element.color,
          backgroundColor: element.color,
          yAxisID: element.isMainYAxis ? 'yLeft' : 'yRight',
        })
      })
      this.isLoaded = true
    },
  },
}
</script>
