namespace Mcma.Logging
{
    public interface ILoggerProvider
    {
        ILogger Get(string requestId = null, McmaTracker tracker = null);
    }
}