import moment from 'moment'
import config, { setVueInstance } from 'buefy/src/utils/config'

import { Switch, Slider, Checkbox, Toast, Dialog, Table, Datetimepicker, Input, Sidebar, Menu, Autocomplete, Collapse, Loading } from 'buefy/src/components'

const Buefy = {
  install (Vue, options = {}) {
    setVueInstance(Vue)
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
    Vue.use(Table)
    Vue.use(Datetimepicker)
    Vue.use(Input)
    Vue.use(Sidebar)
    Vue.use(Menu)
    Vue.use(Autocomplete)
    Vue.use(Collapse)
    Vue.use(Loading)
  },
}

export default Buefy
