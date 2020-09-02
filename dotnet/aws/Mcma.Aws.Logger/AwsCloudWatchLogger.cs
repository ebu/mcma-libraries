using System;
using Mcma;
using Mcma.Logging;

namespace Mcma.Aws.CloudWatch
{
    public class AwsCloudWatchLogger : Logger
    {
        internal AwsCloudWatchLogger(string source, string requestId, McmaTracker tracker, Action<LogEvent> log)
            : base(source, requestId, tracker)
        {
            LogAction = log;
        }

        private Action<LogEvent> LogAction { get; }

        protected override void WriteLogEvent(LogEvent logEvent)
        {
            if (logEvent.Level > 0)
                LogAction(logEvent);
        }
    }
}