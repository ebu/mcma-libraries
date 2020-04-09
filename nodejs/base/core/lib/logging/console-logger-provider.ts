import { LoggerProvider } from "./logger-provider";
import { Logger } from "./logger";
import { McmaTrackerProperties } from "../model/mcma-tracker";
import { ConsoleLogger } from "./console-logger";

export class ConsoleLoggerProvider implements LoggerProvider {
    constructor(private source: string) { }

    get(tracker?: McmaTrackerProperties): Logger {
        return new ConsoleLogger(this.source, tracker);
    }
}
