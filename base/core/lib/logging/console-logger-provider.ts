import { LoggerProvider } from "./logger-provider";
import { Logger } from "./logger";
import { McmaTrackerProperties } from "../model";
import { ConsoleLogger } from "./console-logger";

export class ConsoleLoggerProvider implements LoggerProvider {
    constructor(private source: string) { }

    get(requestId?: string, tracker?: McmaTrackerProperties): Logger {
        return new ConsoleLogger(this.source, requestId, tracker);
    }
}
