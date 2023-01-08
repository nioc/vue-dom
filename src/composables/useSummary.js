export function useSummary() {
  const summaryKeys = [
    {
      key: 'TEMPERATURE',
      label: 'Température',
    }, {
      key: 'LIGHT',
      label: 'Lumières',
    }, {
      key: 'HUMIDITY',
      label: 'Humidité',
    }, {
      key: 'POWER',
      label: 'Puissance',
    }, {
      key: 'DOWNLOAD',
      label: 'Download',
    }, {
      key: 'UPLOAD',
      label: 'Upload',
    },
  ]

  const getSummaryIconClass = (key) => {
    switch (key) {
      case 'humidity':
        return 'fa fa-tint'
      case 'temperature':
        return 'fa fa-thermometer-half'
      case 'light':
        return 'fa fa-lightbulb'
      case 'power':
        return 'fa fa-bolt'
      case 'download':
        return 'fas fa-arrow-down'
      case 'upload':
        return 'fas fa-arrow-up'
    }
    return ''
  }

  const getSummaryUnit = (key) => {
    switch (key) {
      case 'humidity':
        return '%'
      case 'temperature':
        return '°C'
      case 'light':
        return ''
      case 'power':
        return ' W'
      case 'upload':
      case 'download':
        return ' Ko/s'
    }
    return ''
  }

  const getSummaryTypeLabel = (key) => {
    const summaryKey = summaryKeys.find((summaryKey) => summaryKey.key === key)
    return summaryKey ? summaryKey.label : key
  }

  return {
    summaryKeys,
    getSummaryIconClass,
    getSummaryUnit,
    getSummaryTypeLabel,
  }
}
