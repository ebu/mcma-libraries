using System.Collections.Generic;
using System.Collections.ObjectModel;
using Mcma.Core;

namespace Mcma.Api
{
    public class McmaApiRequestContext : IContextVariableProvider
    {
        public McmaApiRequestContext(McmaApiRequest request, IDictionary<string, string> contextVariables)
        {
            Request = request;
            ContextVariables = new ReadOnlyDictionary<string, string>(contextVariables);
        }

        public McmaApiRequest Request { get; }

        public IReadOnlyDictionary<string, string> ContextVariables { get; }

        public McmaApiResponse Response { get; } = new McmaApiResponse();
    }
}
