namespace Mcma.Core.Logging
{
    public interface ILoggerProvider
    {
        ILogger Get(McmaTracker tracker = null);
    }
}