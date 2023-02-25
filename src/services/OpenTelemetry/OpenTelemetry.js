import { trace } from '@opentelemetry/api'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
// import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load'
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin'

const otConfig = Object.assign({}, {
  enabled: false,
  zipkinUrl: 'http://localhost:9411/api/v2/spans',
  apiUrlRegExps: [/.+/g],
  traceDocumentLoad: false,
  traceUserInteraction: false,
  traceXhr: true,
  traceNavigation: true,
  traceStoreState: false,
  traceStoreAction: true,
}, window.custom.ot)

const tracer = trace.getTracer()

const initialize = (serviceName = 'vue-dom', options = {}) => {

  if (!otConfig.enabled) {
    return
  }

  const exporter = new ZipkinExporter({
    url: otConfig.zipkinUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const provider = new WebTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  })

  // provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))
  provider.addSpanProcessor(new BatchSpanProcessor(exporter), {
    scheduledDelayMillis: 500,
  })

  provider.register({
  })

  // Registering auto instrumentations
  const instrumentations = []
  if (otConfig.traceDocumentLoad) {
    instrumentations.push(new DocumentLoadInstrumentation())
  }
  if (otConfig.traceUserInteraction) {
    instrumentations.push(new UserInteractionInstrumentation({
      shouldPreventSpanCreation: (eventType, element, span) => {
        span.setAttributes({ 'target_text': element.textContent })
      },
    }))
  }
  if (otConfig.traceXhr) {
    instrumentations.push(new XMLHttpRequestInstrumentation({
      ignoreUrls: [
        otConfig.zipkinUrl,
      ],
      propagateTraceHeaderCorsUrls: otConfig.apiUrlRegExps,
      applyCustomAttributesOnSpan: (span) => {
        // enhance trace name with url
        if (span.attributes && span.attributes['http.url']) {
          const url = new URL(span.attributes['http.url'])
          span.updateName(`HTTP ${span.attributes['http.method']} ${url.pathname}`)
        }
      },
    }))
  }
  registerInstrumentations({
    instrumentations,
  })

  // Registering vue custom instrumentations
  if (options.router && otConfig.traceNavigation) {
    let navigationSpan = null
    options.router.beforeEach((to, from) => {
      tracer.startActiveSpan('navigation', {
        attributes: {
          'route.from': from.path,
          'route.to': to.path,
        },
      }, span => {
        navigationSpan = span
      })
    })
    options.router.afterEach(() => {
      if (navigationSpan) {
        navigationSpan.end()
      }
    })
  }
  if (options.pinia && (otConfig.traceStoreState || otConfig.traceStoreAction)) {
    options.pinia.use(openTelemetryPiniaPlugin)
  }
}

const openTelemetryPiniaPlugin = ({ store }) => {
  // watch the state
  if (otConfig.traceStoreState) {
    store.$subscribe((mutation) => {
      const attributes = {
        'store.id': mutation.storeId,
        'store.type': mutation.type,
      }
      if (import.meta.env.DEV) {
        attributes['store.key'] = mutation.events.key
      }
      tracer.startActiveSpan(`store.${mutation.storeId} updated ${mutation.type}`, {
        attributes,
      }, span => {
        span.end()
      })
    })
  }
  // observe actions
  if (otConfig.traceStoreAction) {
    store.$onAction(({ name, after, onError }) => {
      let actionSpan = null
      tracer.startActiveSpan(`store.action.${name}`, {
        attributes: {
          'store.action.name': name,
        },
      }, span => {
        actionSpan = span
      })

      after(() => {
        actionSpan.setStatus({ code: 1 })
        actionSpan.end()
      })
      onError((error) => {
        actionSpan.setStatus({ code: 2, message: error.message })
        actionSpan.end()
      })
    }, true)
  }
}

export {
  initialize,
  tracer,
}
