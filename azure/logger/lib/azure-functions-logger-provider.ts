import { AsyncLocalStorage } from "node:async_hooks";
import { Logger, LoggerProvider, LogEvent, LogLevel, McmaTrackerProperties } from "@mcma/core";

/** The logging surface of Azure Functions v4 InvocationContext. No SDK import is required. */
export interface AzureFunctionsLogContext {
    readonly invocationId: string;
    error(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    info(...args: unknown[]): void;
    debug(...args: unknown[]): void;
    trace(...args: unknown[]): void;
}

class AzureFunctionsLogger extends Logger {
    constructor(private readonly context: AzureFunctionsLogContext, source: string,
                requestId?: string, tracker?: McmaTrackerProperties) {
        super(source, requestId ?? context.invocationId, tracker);
    }

    protected writeLogEvent(event: LogEvent): void {
        // Reuse MCMA's Error/cyclic-message handling, then emit one compact JSON record.
        const record = JSON.parse(event.toString());
        const message = JSON.stringify(record);
        if (event.level === 0) this.context.trace(message);
        else if (event.level <= LogLevel.Error) this.context.error(message);
        else if (event.level <= LogLevel.Warn) this.context.warn(message);
        else if (event.level <= LogLevel.Info) this.context.info(message);
        else this.context.debug(message);
    }
}

/** Reusable provider; wrap each complete invocation in runWithContext(). */
export class AzureFunctionsLoggerProvider implements LoggerProvider {
    private readonly contexts = new AsyncLocalStorage<AzureFunctionsLogContext>();

    constructor(private readonly source: string) {}

    /** Await all invocation work inside the callback; do not start detached background work. */
    runWithContext<T>(context: AzureFunctionsLogContext, callback: () => T): T {
        return this.contexts.run(context, callback);
    }

    async get(requestId?: string, tracker?: McmaTrackerProperties): Promise<Logger> {
        const context = this.contexts.getStore();
        if (!context) {
            throw new Error("AzureFunctionsLoggerProvider.get() must run inside runWithContext().");
        }
        // Capture the context in the logger, never look up another invocation at write time.
        return new AzureFunctionsLogger(context, this.source, requestId, tracker);
    }
}
