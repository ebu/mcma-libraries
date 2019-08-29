using System;
using Microsoft.Extensions.Logging;
using IMcmaLogger = Mcma.Core.Logging.ILogger;
using IMicrosoftLogger = Microsoft.Extensions.Logging.ILogger;

namespace Mcma.Azure.Functions.Logging
{
    public class MicrosoftLoggerWrapper : IMcmaLogger
    {
        public MicrosoftLoggerWrapper(IMicrosoftLogger wrappedLogger)
        {
            WrappedLogger = wrappedLogger;
        }

        private IMicrosoftLogger WrappedLogger { get; }

        public void Debug(string message, params object[] args) => WrappedLogger.LogDebug(message, args);

        public void Error(string message, params object[] args) => WrappedLogger.LogError(message, args);

        public void Exception(Exception ex) => WrappedLogger.LogError(ex, "Exception: ");

        public void Info(string message, params object[] args) => WrappedLogger.LogInformation(message, args);

        public void Warn(string message, params object[] args) => WrappedLogger.LogWarning(message, args);
    }
}
