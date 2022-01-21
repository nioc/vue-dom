const provider = window.custom.provider

export default {
  install (Vue, options = { store: null }) {
    if (provider === undefined || !('system' in provider)) {
      throw new Error('No system provider set, check your local.js')
    }
    switch (provider.system) {
      case 'jeedom': {
        Vue.prototype.$Provider = require('@/services/providers/JeedomApi').JeedomApi(
          Vue,
          provider.jsonRpcApiUrl,
          provider.websocketUrl,
          options.store,
          provider.readDelay,
          provider.statisticsPeriod,
          provider.trendPeriod,
          provider.trendThreshold,
        )
        break
      }
      default:
        Vue.prototype.$Provider = {}
        throw new Error(`System provider "${provider.system}" is not handled`)
    }
  },
}
