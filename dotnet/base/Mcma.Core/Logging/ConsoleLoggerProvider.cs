namespace Mcma.Logging
{
    public class ConsoleLoggerProvider : ILoggerProvider
    {
        public ConsoleLoggerProvider(string source)
        {
            Source = source;
        }

        private string Source { get; }

        public ILogger Get(string requestId = null, McmaTracker tracker = null)
            => new ConsoleLogger(Source, requestId, tracker);
    }
}