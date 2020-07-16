import { LoggerProvider, McmaTrackerProperties, Logger } from "@mcma/core";
import { Logging, Log } from "@google-cloud/logging";

import { CloudLoggingLogger } from "./cloud-logging-logger";

export class CloudLoggingLoggerProvider implements LoggerProvider {
    private readonly log: Log;

    constructor(private logging: Logging, private source: string) {
        this.log = this.logging.log(this.source);
    }

    get(requestId?: string, tracker?: McmaTrackerProperties): Logger {
        return new CloudLoggingLogger(this.log, this.source, requestId, tracker);
    }
}