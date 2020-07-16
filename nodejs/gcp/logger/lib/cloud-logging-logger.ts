import { Logger, LogEvent, LogLevel, McmaTrackerProperties } from "@mcma/core";
import { Log, Entry } from "@google-cloud/logging";

const CloudLoggingSeverities = {
    debug: "DEBUG",
    info: "INFO",
    notice: "NOTICE",
    warning: "WARNING",
    error: "ERROR",
    critical: "CRITICAL",
    alert: "ALERT",
    emergency: "EMERGENCY"
};

function convertToCloudLogSeverity(logLevel: number): string {
    switch (logLevel) {
        case LogLevel.Debug:
            return CloudLoggingSeverities.debug;
        case LogLevel.Info:
            return CloudLoggingSeverities.info;
        case LogLevel.Warn:
            return CloudLoggingSeverities.warning;
        case LogLevel.Error:
            return CloudLoggingSeverities.error;
        case LogLevel.Fatal:
            return CloudLoggingSeverities.critical;
        default:
            return CloudLoggingSeverities.debug;
    }
}

function convertToCloudLogEntry(logEvent: LogEvent): Entry {
    return new Entry({
        severity: convertToCloudLogSeverity(logEvent.level),
        timestamp: logEvent.timestamp
    }, logEvent);
}

export class CloudLoggingLogger extends Logger {
    constructor(private cloudLog: Log, source: string, requestId?: string, tracker?: McmaTrackerProperties) {
        super(source, requestId, tracker);
    }

    protected writeLogEvent(logEvent: LogEvent): void {
        this.cloudLog.write(convertToCloudLogEntry(logEvent), err => {
            if (err) {
                try {
                    Logger.System.error("Failed to write log entries to Google Cloud Logging.", err);
                } catch {
                }
            }
        })
    }
}