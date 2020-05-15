import { Logger } from "./logger";
import { McmaTrackerProperties } from "../model";
import { LogEvent } from "./log-event";

export class ConsoleLogger extends Logger {
    constructor(source: string, requestId?: string, tracker?: McmaTrackerProperties) {
        super(source, requestId, tracker);
    }

    log(logEvent: LogEvent): void {
        if (logEvent.level > 0) {
            if (logEvent.level <= 200) {
                console.error(logEvent.toString());
            } else if (logEvent.level < 400) {
                console.warn(logEvent.toString());
            } else {
                console.log(logEvent.toString());
            }
        }
    }
}

Logger.System = new ConsoleLogger("System");
