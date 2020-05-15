import { Logger, LoggerProvider, McmaTrackerProperties } from "@mcma/core";
import * as AppInsights from "applicationinsights";

import { AppInsightsLogger } from "./app-insights-logger";

AppInsights.setup(process.env["APPINSIGHTS_INSTRUMENTATIONKEY"]);
AppInsights.start();

export class AppInsightsLoggerProvider implements LoggerProvider {
    private readonly appInsightsClient: AppInsights.TelemetryClient;

    constructor(private source: string, appInsightsClient?: AppInsights.TelemetryClient) {
        this.appInsightsClient = appInsightsClient ?? AppInsights.defaultClient;
    }

    get(requestId?: string, tracker?: McmaTrackerProperties): Logger {
        return new AppInsightsLogger(this.appInsightsClient, this.source, requestId, tracker);
    }
}
