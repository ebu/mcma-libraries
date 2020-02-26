import { Logger } from "./logger";
import { McmaTrackerProperties } from "../model/mcma-tracker";
import { LogEvent } from "./log-event";


export class ConsoleLogger extends Logger {
    constructor(source: string, tracker?: McmaTrackerProperties) {
        super(source, tracker);
    }

    log(logEvent: LogEvent): void {
        if (logEvent.level > 0) {
            if (logEvent.level <= 200) {
                console.error(logEvent);
            } else if (logEvent.level < 400) {
                console.warn(logEvent);
            } else {
                console.log(logEvent);
            }
        }
    }
}