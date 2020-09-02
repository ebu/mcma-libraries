using System;

namespace Mcma.Logging
{
    public abstract class Logger : ILogger
    {
        protected Logger(string source, string requestId, McmaTracker tracker)
        {
            Source = source;
            RequestId = requestId ?? Guid.NewGuid().ToString();
            Tracker = tracker;
        }

        protected string Source { get; }

        protected string RequestId { get; }

        protected McmaTracker Tracker { get; }

        public static ILogger System { get; set; } = new ConsoleLogger(nameof(System));

        protected LogEvent BuildLogEvent(int level, string type, string message, object[] args)
            => new LogEvent(type, level, Source, RequestId, DateTime.UtcNow, message, args, Tracker);

        protected abstract void WriteLogEvent(LogEvent logEvent);
        
        public void Log(int level, string type, params object[] args)
            => WriteLogEvent(BuildLogEvent(level, type, null, args));
        
        public void Log(int level, string type, string message, params object[] args)
            => WriteLogEvent(BuildLogEvent(level, type, message, args));

        public void Fatal(string message, params object[] args)
            => Log(LogLevel.Fatal, LogType.Fatal, message, args);
        public void Fatal(params object[] args)
            => Log(LogLevel.Fatal, LogType.Fatal, null, args);
        
        public void Error(string message, params object[] args)
            => Log(LogLevel.Error, LogType.Error, message, args);
        public void Error(params object[] args)
            => Log(LogLevel.Error, LogType.Error, null, args);
        
        public void Warn(string message, params object[] args)
            => Log(LogLevel.Warn, LogType.Warn, message, args);
        public void Warn(params object[] args)
            => Log(LogLevel.Warn, LogType.Warn, null, args);
        
        public void Info(string message, params object[] args)
            => Log(LogLevel.Info, LogType.Info, message, args);
        public void Info(params object[] args)
            => Log(LogLevel.Info, LogType.Info, null, args);

        public void Debug(string message, params object[] args)
            => Log(LogLevel.Debug, LogType.Debug, message, args);
        public void Debug(params object[] args)
            => Log(LogLevel.Debug, LogType.Debug, null, args);

        public void FunctionStart(string message, params object[] args)
            => Log(LogLevel.FunctionEvent, LogType.FunctionStart, message, args);
        public void FunctionEnd(string message, params object[] args)
            => Log(LogLevel.FunctionEvent, LogType.FunctionEnd, message, args);

        public void JobStart(params object[] args)
            => Log(LogLevel.Info, LogType.JobStart, null, args);
        public void JobStart(string message, params object[] args)
            => Log(LogLevel.Info, LogType.JobStart, message, args);
        public void JobUpdate(params object[] args)
            => Log(LogLevel.Info, LogType.JobUpdate, null, args);
        public void JobUpdate(string message, params object[] args)
            => Log(LogLevel.Info, LogType.JobUpdate, message, args);
        public void JobEnd(params object[] args)
            => Log(LogLevel.Info, LogType.JobEnd, null, args);
        public void JobEnd(string message, params object[] args)
            => Log(LogLevel.Info, LogType.JobEnd, message, args);
    }
}