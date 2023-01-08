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

  return {
    getHumanSizeCei,
  }
}
