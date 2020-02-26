import { Logger, McmaTrackerProperties, LogEvent } from "@mcma/core";

export class AwsCloudWatchLogger extends Logger {
    constructor(source: string, tracker: McmaTrackerProperties, private addLogEvent: (logEvent: LogEvent) => void) {
        super(source, tracker);
    }

    log(logEvent: LogEvent): void {
        if (logEvent.level > 0) {
            this.addLogEvent(logEvent);
        }
    }
}