const AWS = require("aws-sdk");

const { Exception, Logger } = require("@mcma/core");

const CloudWatchLogs = new AWS.CloudWatchLogs();

class AwsCloudWatchLogger extends Logger {
    constructor(source, tracker, addLogEvent) {
        super(source, tracker);

        this.log = (level, type, msg, ...args) => {
            if (level > 0) {
                const timestamp = Date.now();
                const message = this.buildLogEvent(timestamp, level, type, msg, ...args);

                addLogEvent(message, timestamp);
            }
        };
    }
}

class AwsCloudWatchLoggerProvider {
    constructor(source, logGroupName) {
        if (typeof source !== "string" || typeof logGroupName !== "string") {
            throw new Exception("Failed to initialize AwsCloudWatchLoggerProvider with params source: '" + source + "' and logGroupName: '" + logGroupName + "'");
        }

        const logStreamName = source + "-" + Date.now();

        let logEvents = [];
        let logGroupVerified = false;
        let logStreamCreated = false;
        let processing = false;
        let sequenceToken = undefined;

        const processBatch = async () => {
            if (processing) {
                return;
            }
            try {
                processing = true;

                while (logEvents.length) {
                    if (!logGroupVerified) {
                        let nextToken = undefined;

                        do {
                            const params = {
                                logGroupNamePrefix: logGroupName,
                                nextToken,
                            };

                            const data = await CloudWatchLogs.describeLogGroups(params).promise();

                            for (const logGroup of data.logGroups) {
                                if (logGroup.logGroupName === logGroupName) {
                                    logGroupVerified = true;
                                    break;
                                }
                            }

                            nextToken = data.nextToken;
                        } while (!logGroupVerified && nextToken);

                        if (!logGroupVerified) {

                            const params = {
                                logGroupName
                            };

                            await CloudWatchLogs.createLogGroup(params).promise();
                            logGroupVerified = true;
                        }
                    }

                    if (!logStreamCreated) {
                        const params = {
                            logGroupName,
                            logStreamName
                        };

                        await CloudWatchLogs.createLogStream(params).promise();

                        logStreamCreated = true;
                    }

                    const params = {
                        logEvents,
                        logGroupName,
                        logStreamName,
                        sequenceToken
                    };

                    logEvents = [];

                    const data = await CloudWatchLogs.putLogEvents(params).promise();

                    sequenceToken = data.nextSequenceToken;

                    if (data.rejectedLogEventsInfo) {
                        console.error("AwsCloudWatchLogger: Some log events rejected");
                        console.error(data.rejectedLogEventsInfo);
                    }
                }
            } catch (error) {
                console.error("AwsCloudWatchLogger: Failed to log to CloudWatchLogs");
                console.error(error);
            } finally {
                processing = false;
            }
        };

        const addLogEvent = (message, timestamp) => {
            logEvents.push({ message, timestamp });
            processBatch();
        };

        this.get = (tracker) => new AwsCloudWatchLogger(source, tracker, addLogEvent);
    }
}

module.exports = {
    AwsCloudWatchLoggerProvider
};
