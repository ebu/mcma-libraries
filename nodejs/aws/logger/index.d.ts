import { ILogger, LoggerProvider, McmaTracker } from "@mcma/core"

export class AwsCloudWatchLoggerProvider implements LoggerProvider {
    constructor(source: string, logGroupName: string);

    get(tracker: McmaTracker): ILogger;
}
