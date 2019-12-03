using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amazon.CloudWatchLogs;
using Mcma.Core.Logging;

using McmaLogger = Mcma.Core.Logging.Logger;
using IMcmaLogger = Mcma.Core.Logging.ILogger;
using Amazon.CloudWatchLogs.Model;
using System.Linq;
using Mcma.Core;
using Mcma.Core.Serialization;

namespace Mcma.Aws.CloudWatch
{
    public class AwsCloudWatchLogger : McmaLogger
    {
        public AwsCloudWatchLogger(string source, McmaTracker tracker, Action<LogEvent> log)
            : base(source, tracker)
        {

        }

        protected override void Log(LogEvent logEvent)
        {
        }
    }

    public class AwsCloudWatchLoggerProvider : LoggerProvider<AwsCloudWatchLogger>
    {
        public AwsCloudWatchLoggerProvider(string source, string logGroupName)
            : base(source)
        {
            LogGroupName = logGroupName;
            LogStreamName = source + "-" + Guid.NewGuid();
        }

        private AmazonCloudWatchLogsClient CloudWatchLogsClient { get; } = new AmazonCloudWatchLogsClient();

        private string LogGroupName { get; }

        private string LogStreamName { get; }

        private List<InputLogEvent> LogEvents { get; } = new List<InputLogEvent>();

        private object LogEventsLock { get; } = new object();

        private bool LogGroupCreated { get; set; }
        
        private bool LogStreamCreated { get; set; }

        private Task ProcessingTask { get; set; }
        
        private string SequenceToken { get; set; }

        private async Task ProcessBatchAsync()
        {
            try
            {
                await EnsureLogGroupAndStreamCreatedAsync();
                
                List<InputLogEvent> logEvents;
                lock (LogEventsLock)
                {
                    logEvents = LogEvents.ToList();
                    LogEvents.Clear();
                }

                while (logEvents.Count > 0)
                {
                    var request = new PutLogEventsRequest
                    {
                        LogEvents = logEvents,
                        LogGroupName = LogGroupName,
                        LogStreamName = LogStreamName,
                        SequenceToken = SequenceToken
                    };

                    var data = await CloudWatchLogsClient.PutLogEventsAsync(request);

                    SequenceToken = data.NextSequenceToken;

                    if (data.RejectedLogEventsInfo != null)
                        Logger.System.Error("AwsCloudWatchLogger: Some log events rejected", data.RejectedLogEventsInfo);
                }
            }
            catch (Exception error)
            {
                Logger.System.Error("AwsCloudWatchLogger: Failed to log to CloudWatchLogs", error);
            }
        }

        private async Task EnsureLogGroupAndStreamCreatedAsync()
        {
            if (LogGroupCreated && LogStreamCreated)
                return;

            if (!LogGroupCreated)
            {
                string nextToken = null;

                do
                {
                    var request = new DescribeLogGroupsRequest
                    {
                        LogGroupNamePrefix = LogGroupName,
                        NextToken = nextToken
                    };

                    var data = await CloudWatchLogsClient.DescribeLogGroupsAsync(request);

                    foreach (var logGroup in data.LogGroups)
                    {
                        if (logGroup.LogGroupName == LogGroupName)
                        {
                            LogGroupCreated = true;
                            break;
                        }
                    }

                    nextToken = data.NextToken;
                } while (!LogGroupCreated && !string.IsNullOrWhiteSpace(nextToken));

                if (!LogGroupCreated) {

                    var request = new CreateLogGroupRequest { LogGroupName = LogGroupName };

                    await CloudWatchLogsClient.CreateLogGroupAsync(request);
                    LogGroupCreated = true;
                }
            }
            
            if (!LogStreamCreated)
            {
                var request = new CreateLogStreamRequest
                {
                    LogGroupName = LogGroupName,
                    LogStreamName = LogStreamName
                };

                await CloudWatchLogsClient.CreateLogStreamAsync(request);

                LogStreamCreated = true;
            }
        }

        private void AddLogEvent(LogEvent logEvent)
        {
            lock (LogEventsLock)
                LogEvents.Add(new InputLogEvent { Message = logEvent.ToMcmaJson().ToString(), Timestamp = logEvent.Timestamp.DateTime });

            if (ProcessingTask == null)
            {
                ProcessingTask = ProcessBatchAsync();
                ProcessingTask.ContinueWith(t => ProcessingTask = null);
            }
        }

        protected override AwsCloudWatchLogger Get(string source, McmaTracker tracker = null) => new AwsCloudWatchLogger(source, tracker, AddLogEvent);

        public async Task FlushAsync()
        {
            if (ProcessingTask != null)
                await ProcessingTask;
        }
    }
}