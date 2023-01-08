<script>
import { h } from 'vue'
import { dtMomentFromNow, dtFormat } from '@/services/Datetime'

export default {
  name: 'TimeAgo',
  props: {
    date: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: 'span',
    },
    dropFixes: {
      type: Boolean,
      default: false,
    },
    interval: {
      type: Number,
      default: 10000,
    },
    isStrict: {
      type: Boolean,
      default: true,
    },
    titleFormat: {
      type: String,
      default: null,
    },
  },
  data () {
    return {
      fromNow: null,
      intervalId: null,
    }
  },
  watch: {
    date: function () {
      this.updateFromNow()
    },
  },
  mounted () {
    this.updateFromNow()
    this.intervalId = setInterval(this.updateFromNow, this.interval)
  },
  beforeUnmount () {
    clearInterval(this.intervalId)
  },
  methods: {
    updateFromNow () {
      const fromNow = dtMomentFromNow(this.date, this.dropFixes, this.isStrict)
      if (fromNow !== this.fromNow) {
        this.fromNow = fromNow
      }
    },
  },
  render () {
    return h(this.tag, { style: `white-space: nowrap;${this.titleFormat ? 'cursor: help;' : ''}`, title: this.titleFormat ? dtFormat(this.date, this.titleFormat) : null }, this.fromNow)
  },
}
</script>
