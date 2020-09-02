using System;
using System.Collections.Generic;
using System.Linq;
using Mcma;
using Mcma.Logging;

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

        private static string GetLoggerKey(string source, string requestId, McmaTracker tracker)
            => string.Join("-", new[] {source, requestId, tracker.Id?.Trim()}.Where(x => x != null));

        protected override MicrosoftLoggerWrapper Get(string source, string requestId, McmaTracker tracker)
        {
            var loggerKey = GetLoggerKey(source, requestId, tracker);
            if (!Loggers.ContainsKey(loggerKey))
                throw new Exception($"Unable to create logger with key '{loggerKey}' as there is no associated Microsoft.Extensions.Logging.ILogger object to wrap.");

            return new MicrosoftLoggerWrapper(Loggers[loggerKey], source, requestId, tracker);
        }

        public MicrosoftLoggerWrapper AddLogger(IMicrosoftLogger microsoftLogger, string requestId, McmaTracker tracker = null)
        {
            Loggers[GetLoggerKey(Source, requestId, tracker)] = microsoftLogger;
            
            return Get(Source, requestId, tracker);
        }
    }
}
