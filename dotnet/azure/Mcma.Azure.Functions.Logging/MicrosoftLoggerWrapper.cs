using Mcma.Core;
using Mcma.Core.Logging;
using Mcma.Core.Serialization;
using Microsoft.Extensions.Logging;

using McmaLogger = Mcma.Core.Logging.Logger;
using McmaLogLevel = Mcma.Core.Logging.LogLevel;

using IMicrosoftLogger = Microsoft.Extensions.Logging.ILogger;
using MicrosoftLogLevel = Microsoft.Extensions.Logging.LogLevel;

namespace Mcma.Azure.Functions.Logging
{
    public class MicrosoftLoggerWrapper : McmaLogger
    {
        public MicrosoftLoggerWrapper(IMicrosoftLogger wrappedLogger, string source, McmaTracker tracker)
            : base(source, tracker)
        {
            WrappedLogger = wrappedLogger;
        }

        private IMicrosoftLogger WrappedLogger { get; }

        protected override void Log(LogEvent logEvent)
            => WrappedLogger.Log(MapLogLevel(logEvent.Level), logEvent.ToMcmaJson().ToString());

        private MicrosoftLogLevel MapLogLevel(int mcmaLogLevel)
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
