import { LoggerProvider } from "./logger-provider.js";
import { Logger } from "./logger.js";
import { McmaTrackerProperties } from "../model/index.js";
import { ConsoleLogger } from "./console-logger.js";

export class ConsoleLoggerProvider implements LoggerProvider {
    constructor(private source: string) { }

    async get(requestId?: string, tracker?: McmaTrackerProperties): Promise<Logger> {
        return new ConsoleLogger(this.source, requestId, tracker);
    }
}
