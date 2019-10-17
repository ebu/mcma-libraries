using Mcma.Core.Logging;

namespace Mcma.Core.Context
{
    public interface IContext
    {
        ILogger Logger { get; }

        IContextVariables Variables { get; }
    }
}