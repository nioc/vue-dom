export function useScenarioHelper() {

  const createScenarioElement = (type) => {
    let element = { type }
    switch (type) {
      case 'rule':
        element.definition = {
          type: 'any',
          criterias: [],
          onValidElements: [],
          onInvalidElements: [],
        }
        break
      case 'criteria':
        element = {
          fact: null,
          operator: 'e',
          value: null,
        }
        break
      case 'action':
        element.definition = {
          id: null,
          paramsType: 'string',
          params: null,
        }
        break
      case 'ask':
        element.definition = {
          id: null,
          paramsType: 'string',
          params: null,
          timeout: null,
          onValidElements: [],
          onTimeoutElements: [],
        }
        break
      default:
        break
    }
    return element
  }

  return {
    createScenarioElement,
  }
}
