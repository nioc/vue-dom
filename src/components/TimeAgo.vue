<script>
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
      default: 30000,
    },
  },
  data () {
    return {
      fromNow: this.$moment(this.date).fromNow(this.dropFixes),
      intervalId: null,
    }
  },
  watch: {
    date: function () { this.updateFromNow() },
  },
  mounted () {
    this.intervalId = setInterval(this.updateFromNow, this.interval)
  },
  beforeDestroy () {
    clearInterval(this.intervalId)
  },
  methods: {
    updateFromNow () {
      const fromNow = this.$moment(this.date).fromNow(this.dropFixes)
      if (fromNow !== this.fromNow) {
        this.fromNow = fromNow
      }
    },
  },
  render (h) {
    return h(this.tag, { style: 'white-space: nowrap;' }, this.fromNow)
  },
}
</script>
