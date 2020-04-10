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
          return 'fa-tint'
        case 'TEMPERATURE':
          return 'fa-thermometer-half'
        case 'CO2':
          return 'fa-bullseye'
        case 'VOLTAGE':
        case 'POWER':
          return 'fa-bolt'
      }
      return 'fa-question'
    },
    ...mapActions(['execCmd']),
  },
}
