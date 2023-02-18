import cronstrue from 'cronstrue'
import 'cronstrue/locales/fr'

export function useConversions() {

  const getHumanSizeCei = (size, unit = 'o', precision = 0) => {
    const ratio = Math.pow(10, precision)
    if (size > 1000000000) {
      return `${Math.round(size / Math.pow(2, 30) * ratio) / ratio} Gi${unit}`
    }
    if (size > 1000000) {
      return `${Math.round(size / Math.pow(2, 20) * ratio) / ratio} Mi${unit}`
    }
    if (size > 1000) {
      return `${Math.round(size / Math.pow(2, 10) * ratio) / ratio} Ki${unit}`
    }
    return `${size} ${unit}`
  }

  const getHumanCronTime = (cron) => {
    try {
      return cronstrue.toString(cron, { locale: 'fr' })
    } catch (error) {
      return cron
    }
  }

  const checkCronTime = (cron) => {
    try {
      return {
        result: cronstrue.toString(cron, { locale: 'fr' }),
        isValid: true,
      }
    } catch (error) {
      return {
        result: error.toString(),
        isValid: false,
      }
    }
  }

  return {
    getHumanSizeCei,
    getHumanCronTime,
    checkCronTime,
  }
}
