import { mapGetters, mapActions } from 'vuex'

export const CmdMixin = {
  computed: {
    ...mapGetters(['getCmdById', 'getCmdsByEqLogicId']),
  },
  methods: {
    getBatteryLevelIconClass (level) {
      let iconClass = 'fa fa-battery-full'
      if (level < 20) {
        iconClass = 'fa fa-battery-empty'
      } else if (level < 40) {
        iconClass = 'fa fa-battery-quarter'
      } else if (level < 60) {
        iconClass = 'fa fa-battery-half'
      } else if (level < 80) {
        iconClass = 'fa fa-battery-three-quarters'
      }
      return iconClass
    },
    getIconClass (cmd) {
      switch (cmd.logicalId) {
        case 'refresh':
          return 'fa fa-sync-alt'
        case 'wol':
          return 'fa fa-bolt'
      }
      switch (cmd.generic_type) {
        case 'FLAP_DOWN':
          return 'fa fa-angle-double-down'
        case 'FLAP_STOP':
          return 'fa fa-stop'
        case 'FLAP_UP':
          return 'fa fa-angle-double-up'
        case 'HUMIDITY':
        case 'RAIN_CURRENT':
          return 'fa fa-tint'
        case 'TEMPERATURE': {
          const min = parseInt(cmd.configuration.minValue) || 0
          const max = parseInt(cmd.configuration.maxValue) || 100
          const interval = (max - min) / 5
          if (cmd.currentValue < min + interval) {
            return 'fa fa-thermometer-empty'
          }
          if (cmd.currentValue < min + 2 * interval) {
            return 'fa fa-thermometer-quarter'
          }
          if (cmd.currentValue < min + 3 * interval) {
            return 'fa fa-thermometer-half'
          }
          if (cmd.currentValue < min + 4 * interval) {
            return 'fa fa-thermometer-three-quarters'
          }
          return 'fa fa-thermometer-full'
        }
        case 'CO2':
          return 'fa fa-bullseye'
        case 'VOLTAGE':
        case 'POWER':
          return 'fa fa-bolt'
      }
      if (cmd.display.icon) {
        return cmd.display.icon.match(/class="(.*?)"/)[1] || 'fa fa-question'
      }
      return 'fa fa-question'
    },
    ...mapActions(['execCmd']),
  },
}
