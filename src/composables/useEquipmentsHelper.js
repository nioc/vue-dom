import { useDataStore } from '@/store/data'
import { useDialog } from '@/composables/useDialog'

export function useEquipmentsHelper() {
  const getBatteryLevelIconClass = (level) => {
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
  }

  const getIconClass = (cmd) => {
    switch (cmd.logicalId) {
      case 'refresh':
        return 'fa fa-sync-alt'
      case 'wol':
        return 'fa fa-bolt'
    }
    if (cmd.genericType) {
      switch (cmd.genericType) {
        case 'HUMIDITY':
        case 'RAIN_CURRENT':
          return 'fa fa-tint'
        case 'TEMPERATURE': {
          const min = cmd.minValue || 0
          const max = cmd.maxValue || 100
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
        case 'LIGHT_STATE':
          return 'fas fa-lightbulb'
        case 'CO2':
          return 'fa fa-bullseye'
        case 'PRESENCE':
          return 'fas fa-eye'
        case 'WIND_DIRECTION':
          return 'far fa-compass'
        case 'WIND_SPEED':
          return 'fas fa-wind'
        case 'VOLTAGE':
        case 'POWER':
          return 'fa fa-bolt'
        case 'CAMERA_RECORD_STATE':
          return 'fas fa-video'
        case 'ENERGY_STATE':
          return 'fas fa-power-off'
        case 'IP_ADDRESS':
          return 'fas fa-at'
        case 'STATUS':
          return 'fas fa-toggle-on'
        case 'DOWNLOAD':
          return 'fas fa-arrow-down'
        case 'UPLOAD':
          return 'fas fa-arrow-up'
        case 'SIGNAL_QUALITY':
          return 'fas fa-signal'
        case 'RATE':
          return 'fas fa-tachometer-alt'
        case 'WIFI':
          return 'fas fa-wifi'
        case 'MAP':
          return 'fas fa-sitemap'
        case 'CONNECTION_TYPE':
          return 'fas fa-project-diagram'
      }
    }
    if (cmd.icon) {
      return cmd.icon
    }
    return 'fa fa-question'
  }

  const getFormattedStateCurrentValue = (state, limit = 30) => {
    let formattedValue = state.currentValue
    if (state.type === 'object' && formattedValue) {
      formattedValue = JSON.stringify(formattedValue)
    }
    if (formattedValue && formattedValue.length > limit) {
      formattedValue = formattedValue.substring(0, limit) + '…'
    }
    return formattedValue
  }

  const checkConfirmAndExecuteAction = async (action, args) => {
    const dataStore = useDataStore()
    if (action.needsConfirm) {
      const { confirm } = useDialog()
      return new Promise((resolve) => {
        confirm({
          type: 'is-primary',
          title: 'Confirmation du lancement d\'action',
          message: `Confirmez-vous l'exécution de l'action "${action.name}" ?`,
          hasIcon: true,
          hasCancelButton: true,
          iconClass: 'fas fa-cogs',
          confirmText: 'Oui',
          cancelText: 'Annuler',
        }, (result) => {
          if (result.action === 'ok') {
            if (!args.options) {
              args.options = {}
            }
            args.options.isConfirmed = true
            dataStore.vxExecuteAction(args)
            resolve(true)
          } else {
            resolve(false)
          }
        })
      })
    }
    dataStore.vxExecuteAction(args)
    return true
  }

  const getStateTypeClass = (type) => {
    switch (type) {
      case 'boolean':
        return 'fa fa-toggle-off'
      case 'numeric':
        return 'fas fa-subscript'
      case 'string':
        return 'fas fa-quote-right'
      case 'datetime':
      case 'date':
        return 'far fa-calendar-alt'
      case 'time':
        return 'far fa-clock'
      case 'duration':
        return 'fas fa-hourglass-half'
      case 'object':
        return 'fas fa-code'
      default:
        return 'fas fa-question'
    }
  }

  const getActionTypeClass = (type) => {
    switch (type) {
      case 'button':
        return 'far fa-square'
      case 'slider':
        return 'fa fa-arrows-alt-h'
      case 'select':
        return 'fa fa-list'
      case 'switch':
        return 'fa fa-toggle-off'
      case 'switch_on':
        return 'fa fa-toggle-on'
      case 'switch_off':
        return 'fa fa-toggle-off'
      default:
        return type
    }
  }

  return {
    getBatteryLevelIconClass,
    getIconClass,
    getFormattedStateCurrentValue,
    checkConfirmAndExecuteAction,
    getStateTypeClass,
    getActionTypeClass,
  }
}
