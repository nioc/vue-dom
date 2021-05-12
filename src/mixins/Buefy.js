import moment from 'moment'
import { ConfigProgrammatic, Switch, Slider, Checkbox, Toast, Dialog, Table, Datetimepicker, Input, Sidebar, Menu, Autocomplete, Taginput, Collapse, Loading, Tooltip } from 'buefy'

const Buefy = {
  install (Vue, options = {}) {
    ConfigProgrammatic.setOptions({
      defaultIconPack: 'fas',
      defaultDayNames: moment.weekdaysMin(),
      defaultMonthNames: moment.months().map((month) => month[0].toUpperCase() + month.slice(1)),
      defaultFirstDayOfWeek: 1,
    })
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
    Vue.use(Taginput)
    Vue.use(Collapse)
    Vue.use(Loading)
    Vue.use(Tooltip)
  },
}

export default Buefy
