using System;

namespace Mcma.Core.Logging
{
    public abstract class Logger : ILogger
    {
        protected Logger(string source, McmaTracker tracker)
        {
            Source = source;
            Tracker = tracker;
        }

        protected string Source { get; }

        protected McmaTracker Tracker { get; }

        public static ILogger System { get; set; } = new ConsoleLogger(nameof(System));

        protected LogEvent BuildLogEvent(int level, string type, string message, object[] args)
            => new LogEvent
            {
                TrackerId = Tracker?.Id ?? string.Empty,
                TrackerLabel = Tracker?.Label ?? string.Empty,
                Source = Source ?? string.Empty,
                Timestamp = DateTimeOffset.UtcNow,
                Level = level,
                Type = type,
                Message = message,
                Args = args
            };

        protected abstract void Log(LogEvent logEvent);
        
        public void Fatal(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.Fatal, LogType.Fatal, message, args));
        public void Fatal(params object[] args)
            => Log(BuildLogEvent(LogLevel.Fatal, LogType.Fatal, null, args));
        
        public void Error(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.Error, LogType.Error, message, args));
        public void Error(params object[] args)
            => Log(BuildLogEvent(LogLevel.Error, LogType.Error, null, args));
        
        public void Warn(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.Warn, LogType.Warn, message, args));
        public void Warn(params object[] args)
            => Log(BuildLogEvent(LogLevel.Warn, LogType.Warn, null, args));
        
        public void Info(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.Info, LogType.Info, message, args));
        public void Info(params object[] args)
            => Log(BuildLogEvent(LogLevel.Info, LogType.Info, null, args));

        public void Debug(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.Debug, LogType.Debug, message, args));
        public void Debug(params object[] args)
            => Log(BuildLogEvent(LogLevel.Debug, LogType.Debug, null, args));

        public void FunctionStart(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.StartEndEvent, LogType.FunctionStart, message, args));
        public void FunctionEnd(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.StartEndEvent, LogType.FunctionEnd, message, args));

        public void JobStart(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.StartEndEvent, LogType.JobStart, message, args));
        public void JobEnd(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.StartEndEvent, LogType.JobEnd, message, args));
    }
}