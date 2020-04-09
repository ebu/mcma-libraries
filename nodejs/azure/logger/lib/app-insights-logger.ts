import { Logger, LogEvent, McmaTrackerProperties } from "@mcma/core";
import { TelemetryClient } from "applicationinsights";

export class AppInsightsLogger extends Logger {
    constructor(private appInsightsClient: TelemetryClient, source: string, tracker?: McmaTrackerProperties) {
        super(source, tracker);
    }

    log(logEvent: LogEvent): void {
        this.appInsightsClient.trackTrace({ message: JSON.stringify(logEvent )});
    }
}