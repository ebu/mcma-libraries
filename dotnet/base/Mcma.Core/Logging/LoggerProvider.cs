namespace Mcma.Logging
{
    public abstract class LoggerProvider<T> : ILoggerProvider where T : ILogger
    {
        protected LoggerProvider(string source)
        {
            Source = source;
        }

        protected string Source { get; }

        public ILogger Get(string requestId = null, McmaTracker tracker = null) => Get(Source, requestId, tracker);

        protected abstract T Get(string source, string requestId, McmaTracker tracker);
    }
}