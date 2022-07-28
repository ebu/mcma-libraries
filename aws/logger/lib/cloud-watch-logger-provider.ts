import { v4 as uuidv4 } from "uuid";
import { CloudWatchLogs } from "aws-sdk";
import { LogEvent, Logger, LoggerProvider, McmaException, McmaTrackerProperties, Utils } from "@mcma/core";
import { AwsCloudWatchLogger } from "./cloud-watch-logger";
import { InputLogEvent } from "aws-sdk/clients/cloudwatchlogs";

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

                const preparedLogEvents: { message: string, timestamp: number, byteLength: number }[] = [];

                while (this.logEvents.length) {
                    const logEvent = this.logEvents.shift();

                    let message = logEvent.toString();
                    while (message.length) {
                        const result = byteSubString(message, 262118); // max message byte size

                        preparedLogEvents.push({
                            message: result.text,
                            timestamp: logEvent.timestamp.getTime(),
                            byteLength: result.byteLength + 26, // message byte size + log event byte overhead
                        });

                        message = message.substring(result.text.length);
                    }
                }

                const inputLogEvents: InputLogEvent[] = [];
                let inputLogEventsByteLength: number = 0;

                while (preparedLogEvents.length) {
                    const preparedLogEvent = preparedLogEvents.shift();

                    if (inputLogEventsByteLength + preparedLogEvent.byteLength > 1048576) { // max putLogEventsRequestSize
                        await this.sendLogEvents(inputLogEvents);
                        inputLogEvents.length = 0;
                        inputLogEventsByteLength = 0;
                    }

                    inputLogEvents.push({
                        message: preparedLogEvent.message,
                        timestamp: preparedLogEvent.timestamp,
                    });
                    inputLogEventsByteLength += preparedLogEvent.byteLength;
                }

                await this.sendLogEvents(inputLogEvents);
            }
        } catch (error) {
            console.error("AwsCloudWatchLogger: Failed to log to CloudWatchLogs");
            console.error(error);
        } finally {
            this.processing = false;
        }
    }

    private async sendLogEvents(logEvents: InputLogEvent[]) {
        try {
            const data = await this.cloudWatchLogs.putLogEvents({
                logEvents: logEvents,
                logGroupName: this.logGroupName,
                logStreamName: this.logStreamName,
                sequenceToken: this.sequenceToken
            }).promise();

            this.sequenceToken = data.nextSequenceToken;

            if (data.rejectedLogEventsInfo) {
                console.error("AwsCloudWatchLogger: Some log events rejected");
                console.error(data.rejectedLogEventsInfo);
            }
        } catch (error) {
            console.error("AwsCloudWatchLogger: Failed to log to CloudWatchLogs");
            console.error(error);
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

function byteSubString(str: string, maxLengthInBytes: number): { text: string, byteLength: number } {
    let length = 0;
    for (let i = 0; i < str.length; i++) {
        const codePoint = str.codePointAt(i);
        const codePointLength = codePointUtf8ByteLength(codePoint);
        if (length + codePointLength > maxLengthInBytes) {
            return {
                text: str.substring(0, i),
                byteLength: length,
            };
        }
        length += codePointLength;
    }
    return {
        text: str,
        byteLength: length,
    };
}

function codePointUtf8ByteLength(codePoint: number): number {
    if (codePoint < 0) throw new McmaException(`Invalid codepoint value ${codePoint}`);
    if (codePoint <= 0x7f) return 1;
    if (codePoint <= 0x7ff) return 2;
    if (codePoint <= 0xffff) return 3;
    if (codePoint <= 0x10ffff) return 4;
    throw new McmaException(`Invalid codepoint value ${codePoint}`);
}
