using System;
using System.Collections.Generic;
using Mcma.Core;
using Mcma.Core.Logging;

using IMicrosoftLogger = Microsoft.Extensions.Logging.ILogger;

namespace Mcma.Azure.Functions.Logging
{
    public class MicrosoftLoggerProvider : LoggerProvider<MicrosoftLoggerWrapper>
    {
        public MicrosoftLoggerProvider(string source)
            : base(source)
        {   
        }

        private IDictionary<string, IMicrosoftLogger> Loggers { get; } = new Dictionary<string, IMicrosoftLogger>();

        private string GetLoggerKey(string source, McmaTracker tracker)
            => tracker != null ? $"{source}-{tracker.Id?.Trim()}-{tracker.Label?.Trim()}" : source;

        protected override MicrosoftLoggerWrapper Get(string source, McmaTracker tracker)
        {
            var loggerKey = GetLoggerKey(source, tracker);
            if (!Loggers.ContainsKey(loggerKey))
                throw new Exception($"Unable to create logger with key '{loggerKey}' as there is no associated Microsoft.Extensions.Logging.ILogger object to wrap.");

            return new MicrosoftLoggerWrapper(Loggers[loggerKey], source, tracker);
        }

        public MicrosoftLoggerWrapper AddLogger(IMicrosoftLogger microsoftLogger, McmaTracker tracker = null)
        {
            Loggers[GetLoggerKey(Source, tracker)] = microsoftLogger;
            
            return Get(Source, tracker);
        }
    }
}
