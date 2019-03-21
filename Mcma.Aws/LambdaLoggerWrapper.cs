using System;
using Amazon.Lambda.Core;

namespace Mcma.Aws
{
    public class LambdaLoggerWrapper : Mcma.Core.Logging.ILogger
    {
        private static void Log(string message, params object[] args)
            => LambdaLogger.Log(args != null && args.Length > 0 ? string.Format(message, args) : message);

        public void Debug(string message, params object[] args) => Log(message, args);

        public void Info(string message, params object[] args) => Log(message, args);

        public void Warn(string message, params object[] args) => Log(message, args);

        public void Error(string message, params object[] args) => Log(message, args);

        public void Exception(Exception ex) => Log(ex.ToString());
    }
}