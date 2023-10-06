import { LoggerProvider } from "./logger-provider";
import { Logger } from "./logger";
import { McmaTrackerProperties } from "../model";
import { ConsoleLogger } from "./console-logger";

export class ConsoleLoggerProvider implements LoggerProvider {
    constructor(private source: string) { }

    async get(requestId?: string, tracker?: McmaTrackerProperties): Promise<Logger> {
        return new ConsoleLogger(this.source, requestId, tracker);
    }
}
