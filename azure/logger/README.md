# MCMA Azure logging

The default entry point uses Azure Functions v4 invocation logging. It does not import or initialize Application Insights or OpenTelemetry. Configure the function app's Application Insights integration to export host logs.

```typescript
import { AzureFunctionsLoggerProvider } from "@mcma/azure-logger";
import type { HttpRequest, InvocationContext } from "@azure/functions";

const loggerProvider = new AzureFunctionsLoggerProvider("service-api");
// Pass this same provider to shared MCMA controllers/workers.

export async function handler(request: HttpRequest, context: InvocationContext) {
    return loggerProvider.runWithContext(context, async () => {
        const logger = await loggerProvider.get();
        logger.info("Handling request");
        // Await the controller/worker here so its logger lookups share this invocation.
        return { status: 200 };
    });
}
```

Wrap the complete handler, including error and completion logging. AsyncLocalStorage isolates overlapping invocations. `get()` outside a scope rejects rather than silently sending uncorrelated logs. Each returned logger retains its original invocation context. Await all work before the handler completes; do not cache returned loggers globally or start detached background work. The host manages delivery; there is no application-side `flush()`.

## Output and migration

Each host log contains a compact JSON message with the flattened MCMA event fields. Use the Azure invocation ID as `requestId`, matching the Lambda request ID convention on AWS. There is no duplicate `invocationId` field. An explicit request ID supplied to `get(requestId, tracker)` is preserved; otherwise the invocation ID is used. Pass the invocation context to the Azure API controller with `controller.handleRequest(request, context)` so its internal logs use the same request ID. Errors retain their stack and cyclic messages use MCMA's diagnostic fallback.

Severity mapping: fatal/error use `context.error`, warning uses `context.warn`, information and job events use `context.info`, debug and function lifecycle events use `context.debug`, and level zero uses `context.trace`. The original numeric level and type remain in the JSON. Azure Functions has no fatal logging method.

This changes the telemetry schema: MCMA fields are in the JSON message, not automatically in Application Insights `customDimensions`. For example:

```kusto
traces
| extend mcma = parse_json(message)
| where tostring(mcma.source) == "service-api"
| project timestamp, severityLevel, operation_Id,
          requestId=tostring(mcma.requestId),
          trackerId=tostring(mcma.trackerId), message=mcma.message
```

Use `AppTraces` and `Message`/`SeverityLevel`/`OperationId` when querying the workspace schema instead. Review existing queries and alerts. Host `logging.logLevel` filters and sampling still apply; enable Debug for function lifecycle/debug records and Trace for level-zero records if required. This logger provides application logs, not replacement SDK dependency tracing, metrics, or custom events.

Before adopting it, validate live HTTP/queue/timer logs, operation correlation, tracker queries, error severity, and concurrent invocations in Azure. Local tests cannot establish host-side ingestion or delivery.

## Optional SDK logger

For the previous SDK behavior, explicitly install a compatible `applicationinsights` 3.x package and change the import:

```typescript
import { AppInsightsLoggerProvider } from "@mcma/azure-logger/application-insights";
```

This subpath retains the existing SDK setup/start behavior when `APPLICATIONINSIGHTS_CONNECTION_STRING` is set, custom trace properties, and `flush()`. The SDK is an optional peer dependency; the default Functions logger does not require it. The old root-level SDK exports and undocumented deep imports are no longer available in 2.0.0.
