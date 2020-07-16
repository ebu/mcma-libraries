import { Logger, McmaTrackerProperties, LogEvent } from "@mcma/core";

export class AwsCloudWatchLogger extends Logger {
    constructor(private addLogEvent: (logEvent: LogEvent) => void, source: string, requestId?: string, tracker?: McmaTrackerProperties) {
        super(source, requestId, tracker);
    }

    protected writeLogEvent(logEvent: LogEvent): void {
        if (logEvent.level > 0) {
            this.addLogEvent(logEvent);
        }
    }
}
