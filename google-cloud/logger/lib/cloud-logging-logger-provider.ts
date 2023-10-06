import { LoggerProvider, McmaTrackerProperties, Logger } from "@mcma/core";
import { Logging, Log } from "@google-cloud/logging";

import { CloudLoggingLogger } from "./cloud-logging-logger";

export class CloudLoggingLoggerProvider implements LoggerProvider {
    private readonly log: Log;

    constructor(private source: string, private logging = new Logging()) {
        this.log = this.logging.log(this.source);
    }

    async get(requestId?: string, tracker?: McmaTrackerProperties): Promise<Logger> {
        return new CloudLoggingLogger(this.log, this.source, requestId, tracker);
    }
}
