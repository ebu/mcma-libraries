import { Logger, LoggerProvider, McmaTrackerProperties } from "@mcma/core";
import * as AppInsights from "applicationinsights";

import { AppInsightsLogger } from "./app-insights-logger";

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    AppInsights.setup().start();
}

export class AppInsightsLoggerProvider implements LoggerProvider {
    private readonly appInsightsClient: AppInsights.TelemetryClient;

    constructor(private source: string, appInsightsClient?: AppInsights.TelemetryClient) {
        this.appInsightsClient = appInsightsClient ?? AppInsights.defaultClient;
    }

    async get(requestId?: string, tracker?: McmaTrackerProperties): Promise<Logger> {
        return new AppInsightsLogger(this.appInsightsClient, this.source, requestId, tracker);
    }

    flush(): void {
        this.appInsightsClient.flush();
    }
}
