using Mcma;
using Mcma.Logging;
using Mcma.Serialization;
using Microsoft.Extensions.Logging;

using McmaLogger = Mcma.Logging.Logger;
using McmaLogLevel = Mcma.Logging.LogLevel;

using IMicrosoftLogger = Microsoft.Extensions.Logging.ILogger;
using MicrosoftLogLevel = Microsoft.Extensions.Logging.LogLevel;

namespace Mcma.Azure.Functions.Logging
{
    public class MicrosoftLoggerWrapper : McmaLogger
    {
        public MicrosoftLoggerWrapper(IMicrosoftLogger wrappedLogger, string source, string requestId, McmaTracker tracker)
            : base(source, requestId, tracker)
        {
            WrappedLogger = wrappedLogger;
        }

        private IMicrosoftLogger WrappedLogger { get; }

        protected override void WriteLogEvent(LogEvent logEvent)
            => WrappedLogger.Log(MapLogLevel(logEvent.Level), logEvent.ToMcmaJson().ToString());

        private static MicrosoftLogLevel MapLogLevel(int mcmaLogLevel)
        {
            if (mcmaLogLevel >= McmaLogLevel.Debug)
                return MicrosoftLogLevel.Debug;
            if (mcmaLogLevel >= McmaLogLevel.Info)
                return MicrosoftLogLevel.Information;
            if (mcmaLogLevel >= McmaLogLevel.Warn)
                return MicrosoftLogLevel.Warning;
            if (mcmaLogLevel >= McmaLogLevel.Error)
                return MicrosoftLogLevel.Error;
            if (mcmaLogLevel >= McmaLogLevel.Fatal)
                return MicrosoftLogLevel.Critical;

            return MicrosoftLogLevel.None;
        }
    }
}
