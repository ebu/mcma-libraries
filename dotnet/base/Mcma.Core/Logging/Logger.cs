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
            => Log(BuildLogEvent(LogLevel.Fatal, nameof(Fatal).ToUpper(), message, args));
        public void Fatal(params object[] args)
            => Log(BuildLogEvent(LogLevel.Fatal, nameof(Fatal).ToUpper(), null, args));
        
        public void Error(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.Error, nameof(Error).ToUpper(), message, args));
        public void Error(params object[] args)
            => Log(BuildLogEvent(LogLevel.Error, nameof(Error).ToUpper(), null, args));
        
        public void Warn(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.Warn, nameof(Warn).ToUpper(), message, args));
        public void Warn(params object[] args)
            => Log(BuildLogEvent(LogLevel.Warn, nameof(Warn).ToUpper(), null, args));
        
        public void Info(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.Info, nameof(Info).ToUpper(), message, args));
        public void Info(params object[] args)
            => Log(BuildLogEvent(LogLevel.Info, nameof(Error).ToUpper(), null, args));

        public void Debug(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.Debug, nameof(Debug).ToUpper(), message, args));
        public void Debug(params object[] args)
            => Log(BuildLogEvent(LogLevel.Debug, nameof(Debug).ToUpper(), null, args));

        public void FunctionStart(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.StartEndEvent, nameof(FunctionStart).ToUpper(), message, args));
        public void FunctionEnd(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.StartEndEvent, nameof(FunctionEnd).ToUpper(), message, args));

        public void JobStart(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.StartEndEvent, nameof(JobStart).ToUpper(), message, args));
        public void JobEnd(string message, params object[] args)
            => Log(BuildLogEvent(LogLevel.StartEndEvent, nameof(JobEnd).ToUpper(), message, args));
    }
}