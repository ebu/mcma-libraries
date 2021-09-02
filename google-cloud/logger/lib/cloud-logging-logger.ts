import { Logger, LogEvent, LogLevel, McmaTrackerProperties } from "@mcma/core";
import { Log, Entry } from "@google-cloud/logging";
import { objToStruct } from "@google-cloud/logging/build/src/common";

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
    if (logLevel >= LogLevel.Debug) {
        return CloudLoggingSeverities.debug;
    }
    if (logLevel >= LogLevel.Info) {
        return CloudLoggingSeverities.info;
    }
    if (logLevel >= LogLevel.Warn) {
        return CloudLoggingSeverities.warning;
    }
    if (logLevel >= LogLevel.Error) {
        return CloudLoggingSeverities.error;
    }
    if (logLevel >= LogLevel.Fatal) {
        return CloudLoggingSeverities.critical;
    }
    return CloudLoggingSeverities.emergency;
}

function convertToCloudLogEntry(logEvent: LogEvent): Entry {
    return new Entry({
        severity: convertToCloudLogSeverity(logEvent.level),
        timestamp: logEvent.timestamp,
        jsonPayload: objToStruct(logEvent, {
            removeCircular: true,
            stringify: true,
        })
    });
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