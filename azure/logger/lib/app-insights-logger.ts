import { Logger, LogEvent, McmaTrackerProperties } from "@mcma/core";
import { TelemetryClient } from "applicationinsights";

export class AppInsightsLogger extends Logger {
    constructor(private appInsightsClient: TelemetryClient, source: string, requestId?: string, tracker?: McmaTrackerProperties) {
        super(source, requestId, tracker);
    }

    protected writeLogEvent(logEvent: LogEvent): void {
        this.appInsightsClient.trackTrace({ message: logEvent.toString() });
    }
}
