export const AdminScenarioMixin = {
  methods: {
    createScenarioElement (type) {
      const element = { type }
      switch (type) {
        case 'rule':
          element.definition = {
            type: 'any',
            criterias: [],
            onValidElements: [],
            onInvalidElements: [],
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
            onValidElements: [],
            onTimeoutElements: [],
          }
          break
        default:
          break
      }
      return element
    },
  },
}
