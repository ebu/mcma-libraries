import { Logger } from "./logger.js";
import { McmaTrackerProperties } from "../model/index.js";
import { LogEvent } from "./log-event.js";

export class ConsoleLogger extends Logger {
    constructor(source: string, requestId?: string, tracker?: McmaTrackerProperties) {
        super(source, requestId, tracker);
    }

    protected writeLogEvent(logEvent: LogEvent): void {
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
