export const ConversionMixin = {
  methods: {
    getHumanSizeCei (size, unit = 'o') {
      if (size > 1000000000) {
        return `${Math.round(size / Math.pow(2, 30))} Gi${unit}`
      }
      if (size > 1000000) {
        return `${Math.round(size / Math.pow(2, 20))} Mi${unit}`
      }
      if (size > 1000) {
        return `${Math.round(size / Math.pow(2, 10))} Ki${unit}`
      }
      return `${size} ${unit}`
    },
  },
}
