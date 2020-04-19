import moment from 'moment'
import config from 'buefy/src/utils/config'
import { Switch, Slider, Checkbox, Toast, Dialog, Datetimepicker, Input } from 'buefy/src/components'

const Buefy = {
  install (Vue, options = {}) {
    // options
    config.defaultIconPack = 'fas'
    config.defaultDayNames = moment.weekdaysMin()
    config.defaultMonthNames = moment.months().map((month) => month[0].toUpperCase() + month.slice(1))
    config.defaultFirstDayOfWeek = 1
    // components
    Vue.use(Switch)
    Vue.use(Slider)
    Vue.use(Checkbox)
    Vue.use(Toast)
    Vue.use(Dialog)
    Vue.use(Datetimepicker)
    Vue.use(Input)
  },
}

export default Buefy
