using System.Collections.Generic;
using Mcma.Core.Logging;

namespace Mcma.Core.Context
{
    public class Context : IContext
    {
        public Context(IDictionary<string, string> contextVariables)
            : this(null, contextVariables)
        {
        }

        public Context(ILogger logger, IDictionary<string, string> contextVariables)
            : this(logger, new ContextVariables(contextVariables))
        {

        }

        public Context(ILogger logger = null, IContextVariables contextVariables = null)
        {
            Logger = logger ?? Logging.Logger.Global;
            Variables = contextVariables ?? new EnvironmentVariables();
        }

        public ILogger Logger { get; }

        public IContextVariables Variables { get; }
    }
}