import opentelemetry from '@opentelemetry/api'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
// import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
// import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load'
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'
import { ZoneContextManager } from '@opentelemetry/context-zone'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin'
const config = window.custom

const _openTelemetry = (serviceName = 'vue-dom') => {

  const exporterUrl = config.otZipkinUrl || 'http://localhost:9411/api/v2/spans'
  const apiUrlRegExps = config.otApiUrlRegExps || [/.+/g]

  const exporter = new ZipkinExporter({
    url: exporterUrl,
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
  // provider.addSpanProcessor(new SimpleSpanProcessor(exporter))
  provider.addSpanProcessor(new BatchSpanProcessor(exporter), {
    scheduledDelayMillis: 500,
  })

  provider.register({
    contextManager: new ZoneContextManager(),
  })

  // Registering instrumentations
  registerInstrumentations({
    instrumentations: [
      // new DocumentLoadInstrumentation(),
      new UserInteractionInstrumentation({
        shouldPreventSpanCreation: (eventType, element, span) => {
          span.updateName(`${eventType} ${element.textContent}`)
        },
      }),
      new XMLHttpRequestInstrumentation({
        ignoreUrls: [
          exporterUrl,
        ],
        propagateTraceHeaderCorsUrls: apiUrlRegExps,
        applyCustomAttributesOnSpan: (span) => {
          // enhance trace name with url
          if (span.attributes && span.attributes['http.url']) {
            span.updateName(`HTTP ${span.attributes['http.method']} ${span.attributes['http.url']}`)
          }
        },
      }),
    ],
  })

  return opentelemetry.trace.getTracer(serviceName)
}

export { _openTelemetry as openTelemetry }
