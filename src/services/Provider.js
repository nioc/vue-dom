import { AbstractProvider } from '@/services/providers/AbstractProvider'

const providerConfig = window.custom.provider

export let provider = new AbstractProvider()

export async function initProvider() {
  if (provider && provider.constructor !== AbstractProvider) {
    return provider
  }
  if (providerConfig === undefined || !('system' in providerConfig)) {
    throw new Error('No system provider set, check your local.js')
  }
  try {
    const { Provider } = await import (`@/services/providers/${providerConfig.system}/Provider.js`)
    provider = new Provider(providerConfig)
  } catch (error) {
    throw new Error(`Provider "${providerConfig.system}" is not found, check your local.js`)
  }
  return provider
}
