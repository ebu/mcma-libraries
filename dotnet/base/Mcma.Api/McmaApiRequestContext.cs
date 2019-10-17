using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using Mcma.Core;
using Mcma.Core.Context;
using Mcma.Core.Serialization;
using Newtonsoft.Json.Linq;

namespace Mcma.Api
{
    public class McmaApiRequestContext : Context
    {
        private static readonly HttpMethod[] MethodsSupportingRequestBody = {HttpMethod.Post, HttpMethod.Put, new HttpMethod("PATCH")};

        public McmaApiRequestContext(McmaApiRequest request, IDictionary<string, string> contextVariables)
            : base(contextVariables)
        {
            Request = request;
        }

        public McmaApiRequest Request { get; }

        public McmaApiResponse Response { get; } = new McmaApiResponse();

        public bool HasRequestBody() => !string.IsNullOrWhiteSpace(Request?.Body);

        public bool MethodSupportsRequestBody()
            => MethodsSupportingRequestBody.Any(x => x.Method.Equals(Request.HttpMethod.Method, StringComparison.OrdinalIgnoreCase));

        public string GetRequestHeader(string header) => Request?.Headers != null && Request.Headers.ContainsKey(header) ? Request.Headers[header] : null;

        public JToken GetRequestBodyJson() => Request?.JsonBody;

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
