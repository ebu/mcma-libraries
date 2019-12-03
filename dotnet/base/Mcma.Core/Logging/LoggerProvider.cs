namespace Mcma.Core.Logging
{
    public abstract class LoggerProvider<T> : ILoggerProvider where T : ILogger
    {
        protected LoggerProvider(string source)
        {
            Source = source;
        }

        protected string Source { get; }

        public ILogger Get(McmaTracker tracker = null) => Get(Source, tracker);

        protected abstract T Get(string source, McmaTracker tracker);
    }
}