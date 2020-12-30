import { v4 as uuidv4 } from "uuid";
import { CloudWatchLogs } from "aws-sdk";
import { LogEvent, Logger, LoggerProvider, McmaException, McmaTrackerProperties, Utils } from "@mcma/core";
import { AwsCloudWatchLogger } from "./cloud-watch-logger";

export class AwsCloudWatchLoggerProvider implements LoggerProvider {

    private readonly logStreamName: string;
    private logEvents: LogEvent[] = [];
    private logGroupVerified = false;
    private logStreamCreated = false;
    private processing = false;
    private sequenceToken: string = undefined;

    constructor(private source: string, private logGroupName: string, private cloudWatchLogs: CloudWatchLogs = new CloudWatchLogs()) {
        if (typeof source !== "string" || typeof logGroupName !== "string") {
            throw new McmaException("Failed to initialize AwsCloudWatchLoggerProvider with params source: '" + source + "' and logGroupName: '" + logGroupName + "'");
        }
        this.logStreamName = source + "-" + uuidv4();
    }

    private async processBatch() {
        if (this.processing || this.logEvents.length === 0) {
            return;
        }

        try {
            this.processing = true;

            while (this.logEvents.length > 0) {
                if (!this.logGroupVerified) {

                    let nextToken = undefined;
                    do {
                        const params: CloudWatchLogs.DescribeLogGroupsRequest = {
                            logGroupNamePrefix: this.logGroupName,
                            nextToken,
                        };

                        const data = await this.cloudWatchLogs.describeLogGroups(params).promise();
                        for (const logGroup of data.logGroups) {
                            if (logGroup.logGroupName === this.logGroupName) {
                                this.logGroupVerified = true;
                                break;
                            }
                        }

                        nextToken = data.nextToken;
                    } while (!this.logGroupVerified && nextToken);

                    if (!this.logGroupVerified) {
                        const params = {
                            logGroupName: this.logGroupName
                        };
                        await this.cloudWatchLogs.createLogGroup(params).promise();
                        this.logGroupVerified = true;
                    }
                }

                if (!this.logStreamCreated) {
                    const params = {
                        logGroupName: this.logGroupName,
                        logStreamName: this.logStreamName
                    };
                    await this.cloudWatchLogs.createLogStream(params).promise();
                    this.logStreamCreated = true;
                }

                const params: CloudWatchLogs.PutLogEventsRequest = {
                    logEvents: this.logEvents.map(le => ({
                        message: le.toString().substring(0, 262144),
                        timestamp: le.timestamp.getTime()
                    })),
                    logGroupName: this.logGroupName,
                    logStreamName: this.logStreamName,
                    sequenceToken: this.sequenceToken
                };

                this.logEvents = [];

                const data = await this.cloudWatchLogs.putLogEvents(params).promise();

                this.sequenceToken = data.nextSequenceToken;

                if (data.rejectedLogEventsInfo) {
                    console.error("AwsCloudWatchLogger: Some log events rejected");
                    console.error(data.rejectedLogEventsInfo);
                }
            }
        } catch (error) {
            console.error("AwsCloudWatchLogger: Failed to log to CloudWatchLogs");
            console.error(error);
        } finally {
            this.processing = false;
        }
    }

    private addLogEvent(logEvent: LogEvent): void {
        this.logEvents.push(logEvent);
        setTimeout(() => this.processBatch(), 1000);
    }

    get(requestId?: string, tracker?: McmaTrackerProperties): Logger {
        return new AwsCloudWatchLogger(le => this.addLogEvent(le), this.source, requestId, tracker);
    }

    async flush(until?: Date | number): Promise<void> {
        while (this.logEvents.length > 0 || this.processing) {
            const now = Date.now();
            if (typeof until === "number" && until < now || until instanceof Date && until.getTime() < now) {
                console.warn("Not able to flush all log messages to CloudWatch Logs within deadline. " + this.logEvents.length + " Remaining messages:");
                for (const logEvent of this.logEvents) {
                    console.warn(logEvent.toString());
                }
                return;
            }

            await Utils.sleep(10);
        }
    }
}
