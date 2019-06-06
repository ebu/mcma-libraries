using System.Collections.Generic;
using System.Collections.ObjectModel;
using Mcma.Core;
using Mcma.Core.ContextVariables;

namespace Mcma.Api
{
    public class McmaApiRequestContext : ContextVariableProvider
    {
        public McmaApiRequestContext(McmaApiRequest request, IDictionary<string, string> contextVariables)
            : base(contextVariables)
        {
            Request = request;
        }

        public McmaApiRequest Request { get; }

        public McmaApiResponse Response { get; } = new McmaApiResponse();
    }
}
