const providerConfig = window.custom.provider

export let provider = null

export async function initProvider() {
  if (provider) {
    return provider
  }
  if (providerConfig === undefined || !('system' in providerConfig)) {
    throw new Error('No system provider set, check your local.js')
  }
  switch (providerConfig.system) {
    case 'jeedom': {
      const { JeedomApi } = await import ('@/services/providers/JeedomApi')
      provider = JeedomApi(
        providerConfig.jsonRpcApiUrl,
        providerConfig.websocketUrl,
        providerConfig.readDelay,
        providerConfig.statisticsPeriod,
        providerConfig.trendPeriod,
        providerConfig.trendThreshold,
      )
      break
    }
    default:
      throw new Error(`System provider "${providerConfig.system}" is not handled`)
  }
  return provider
}
