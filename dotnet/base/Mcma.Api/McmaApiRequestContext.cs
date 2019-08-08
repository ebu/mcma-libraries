using System.Collections.Generic;
using System.Net;
using Mcma.Core;
using Mcma.Core.ContextVariables;
using Mcma.Core.Serialization;

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

        public bool HasRequestBody() => !string.IsNullOrWhiteSpace(Request?.Body);

        public T GetRequestBody<T>() where T : McmaResource => Request?.JsonBody?.ToMcmaObject<T>();

        public void SetResponseStatusCode(HttpStatusCode status, string statusMessage = null)
            => SetResponseStatus((int)status, statusMessage);

        public void SetResponseStatus(int status, string statusMessage = null)
        {
            Response.StatusCode = status;
            Response.StatusMessage = statusMessage;
        }

        public void SetResponseBody(object body) => Response.JsonBody = body?.ToMcmaJson();

        public void SetResponseHeader(string header, string value) => Response.Headers[header] = value;
    }
}
