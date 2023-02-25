// create fake tracer if OT is disabled
const span = {
  end: () => {},
  setStatus: () => {},
  recordException: () => {},
  setAttribute: () => {},
  setAttributes: () => {},
}
let tracer = {
  startSpan: () => {
    return span
  },
  startActiveSpan: (...args) => {
    if (args.length === 0) {
      return
    }
    const callback = args[args.length - 1]
    if (typeof callback === 'function') {
      return callback.call(this, span)
    }
  },
}

const initialize = async (name, options) => {
  if (window.custom.ot && window.custom.ot.enabled) {
    // intialize Open Telemetry and set real tracer
    const { initialize: _initialize, tracer: _tracer } = await import ('./OpenTelemetry.js')
    tracer = _tracer
    return _initialize(name, options)
  }
}

export {
  initialize,
  tracer,
}
