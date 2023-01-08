<script>
import { h } from 'vue'
import { dtFormat } from '@/services/Datetime'

function createEventNode (events, eventSlot, displayDate) {
  return h(
    'ul',
    events.map((event) => {
      return h(
        'li',
        { key: event.id, class: 'timeline-event' },
        [
          h('time', { class: 'timeline-event-time is-hidden-mobile', datetime: event.isoTime }, displayDate ? event.datetime : event.time),
          h(
            'div',
            { class: 'timeline-event-icon' },
            h('i', { class: `fa-fw ${event.icon}` }),
          ),
          h('div', eventSlot ? eventSlot(event) : h('div', event.description)),
        ],
      )
    }),
  )
}

export default {
  name: 'Timeline',
  props: {
    events: {
      type: Object,
      required: true,
    },
    groupByDay: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    _events () {
      return this.events.map(event => {
        event.datetime = dtFormat(event.date, 'd MMM HH:mm')
        event.time = dtFormat(event.date, 'HH:mm')
        event.isoTime = dtFormat(event.date, 'ISO')
        return event
      })
    },
    _eventsByDate () {
      return Object.entries(this._events.reduce((dates, event) => {
        const date = dtFormat(event.date, 'ISO').split('T')[0]
        if (!dates[date]) {
          dates[date] = []
        }
        dates[date].push(event)
        return dates
      }, {}))
    },
  },
  render() {
    if (!this.groupByDay) {
      return createEventNode(this._events, this.$slots.default, true)
    }
    return h(
      'ul',
      this._eventsByDate.map((date) => {
        return h(
          'li',
          { key: date[0], class: 'mb-4' },
          [
            h('div', { class: 'timeline-day mb-2 is-capitalized has-text-weight-light' }, dtFormat(new Date(date[0]), 'cccc d LLLL')),
            h('time', createEventNode(date[1], this.$slots.default, false)),
          ],
        )
      }),
    )
  },
}
</script>

<style scoped>
.timeline-event {
  display: flex;
  align-items: center;
  padding: 0.5em 0;
  position:relative;
  flex-shrink: 0;
}
.timeline-event:before {
    content:"";
    position: absolute;
    z-index: 0;
    top: 0;
    bottom: 0;
    left: 92px;
    border-left: 3px solid #9b9a9a2e;
}
@media screen and (max-width: 768px) {
  .timeline-event:before {
      left: 28px;
  }
}
.timeline-event-time {
  flex-shrink: 0;
  width: 4em;
  padding-left: 0.5em;
  text-align: center;
  opacity: 0.6;
}
.timeline-event-icon {
  background-color: hsl(0, 0%, 86%);
  border: solid #FFF 3px;
  border-radius: 50%;
  width: 43px;
  height: 43px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-left: 0.5em;
  margin-right: 1rem;
  flex-shrink: 0;
}
html[data-theme="dark"] .timeline-event-icon {
  background-color: #353535;
  border: solid #232323 3px;
}
</style>
