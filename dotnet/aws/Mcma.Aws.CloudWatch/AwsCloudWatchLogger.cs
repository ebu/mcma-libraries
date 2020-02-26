using System;
using Mcma.Core;
using Mcma.Core.Logging;

namespace Mcma.Aws.CloudWatch
{
    public class AwsCloudWatchLogger : Logger
    {
        internal AwsCloudWatchLogger(string source, McmaTracker tracker, Action<LogEvent> log)
            : base(source, tracker)
        {
            LogAction = log;
        }

        private Action<LogEvent> LogAction { get; }

        protected override void Log(LogEvent logEvent)
        {
            if (logEvent.Level > 0)
                LogAction(logEvent);
        }
    }
}