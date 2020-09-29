import { Logger, LogEvent, McmaTrackerProperties, LogLevel } from "@mcma/core";
import { Contracts, TelemetryClient } from "applicationinsights";

function createTraceTelemetry(logEvent: LogEvent): Contracts.TraceTelemetry {
    const message = logEvent.message;
    const flattenedLogEvent = logEvent.flatten();
    delete flattenedLogEvent.message;

    const properties =
        Object.keys(flattenedLogEvent)
            .reduce<{ [key: string]: string }>(
                (agg, cur) => {
                    agg[cur] = getStringValue(flattenedLogEvent[cur]);
                    return agg;
                },
                {});

    return {
        message: message && typeof message !== "string" ? JSON.stringify(message) : message,
        severity: getSeverityLevel(logEvent.level),
        time: logEvent.timestamp,
        properties
    };
}

function getSeverityLevel(logLevel: number): Contracts.SeverityLevel {
    if (logLevel === 0) {
        return Contracts.SeverityLevel.Verbose;
    }
    if (logLevel <= LogLevel.Fatal) {
        return Contracts.SeverityLevel.Critical;
    }
    if (logLevel <= LogLevel.Error) {
        return Contracts.SeverityLevel.Error;
    }
    if (logLevel <= LogLevel.Warn) {
        return Contracts.SeverityLevel.Warning;
    }
    if (logLevel <= LogLevel.Info) {
        return Contracts.SeverityLevel.Information;
    }
    return Contracts.SeverityLevel.Verbose;
}

function getStringValue(value: any): string | undefined {
    if (typeof value === "string" || typeof value === "undefined") {
        return value;
    }

    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
        return value.toString();
    }

    if (typeof value === "object") {
        if (value instanceof Date) {
            return value.toISOString();
        } else {
            return JSON.stringify(value);
        }
    }

    return undefined;
}

export class AppInsightsLogger extends Logger {
    constructor(private appInsightsClient: TelemetryClient, source: string, requestId?: string, tracker?: McmaTrackerProperties) {
        super(source, requestId, tracker);
    }

    protected writeLogEvent(logEvent: LogEvent): void {
        this.appInsightsClient.trackTrace(createTraceTelemetry(logEvent));
    }
}
