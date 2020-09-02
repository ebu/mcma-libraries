using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using Mcma.Context;
using Mcma.Logging;
using Mcma.Serialization;
using Mcma.Client;
using Newtonsoft.Json.Linq;

namespace Mcma.Api
{
    public class McmaApiRequestContext : ContextVariableProvider
    {
        private static readonly HttpMethod[] MethodsSupportingRequestBody = {HttpMethod.Post, HttpMethod.Put, new HttpMethod("PATCH")};

        public McmaApiRequestContext(McmaApiRequest request, IDictionary<string, string> contextVariables, ILoggerProvider loggerProvider = null)
            : base(contextVariables)
        {
            Request = request;
            LoggerProvider = loggerProvider;
        }

        public McmaApiRequest Request { get; }

        public ILoggerProvider LoggerProvider { get; }

        public McmaApiResponse Response { get; } = new McmaApiResponse();

        public string RequestId => Request?.Id;

        public bool HasRequestBody() => !string.IsNullOrWhiteSpace(Request?.Body);

        public bool MethodSupportsRequestBody()
            => MethodsSupportingRequestBody.Any(x => x.Method.Equals(Request.HttpMethod.Method, StringComparison.OrdinalIgnoreCase));

        public string GetRequestHeader(string header) => Request?.Headers != null && Request.Headers.ContainsKey(header) ? Request.Headers[header] : null;

        public bool ValidateRequestBodyJson() => !MethodSupportsRequestBody() || string.IsNullOrWhiteSpace(Request?.Body) || GetRequestBodyJson() != null;

        public JToken GetRequestBodyJson()
        {
            if (Request != null && Request.JsonBody == null && MethodSupportsRequestBody() && !string.IsNullOrWhiteSpace(Request.Body))
            {
                try
                {
                    Request.JsonBody = JToken.Parse(Request.Body);
                }
                catch (Exception ex)
                {
                    Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    Response.JsonBody = new McmaApiError(Response.StatusCode, ex.ToString(), Request.Path).ToMcmaJson();
                }
            }

            return Request?.JsonBody;
        }

        public T GetRequestBody<T>() where T : McmaObject => Request?.JsonBody?.ToMcmaObject<T>();

        public void SetResponseStatusCode(HttpStatusCode status, string statusMessage = null)
            => SetResponseStatus((int)status, statusMessage);

        public void SetResponseStatus(int status, string statusMessage = null)
        {
            Response.StatusCode = status;
            Response.StatusMessage = statusMessage;
        }

        public void SetResponseBody(object body) => Response.JsonBody = body?.ToMcmaJson();

        public void SetResponseHeader(string header, string value) => Response.Headers[header] = value;

        public McmaTracker GetTracker()
        {
            string tracker = null;

            // try to get the tracker from the headers or query string first
            var hasTracker =
                (Request?.Headers?.TryGetValue(McmaHttpHeaders.Tracker, out tracker) ?? false) ||
                (Request?.QueryStringParameters?.TryGetValue(McmaHttpHeaders.Tracker, out tracker) ?? false);
            if (hasTracker && tracker != null)
            {
                try
                {
                    var trackerDataJson = Encoding.UTF8.GetString(Convert.FromBase64String(tracker));
                    if (!string.IsNullOrWhiteSpace(trackerDataJson))
                        return JToken.Parse(trackerDataJson).ToMcmaObject<McmaTracker>();
                }
                catch (Exception e)
                {
                    LoggerProvider?.Get(RequestId)?.Warn($"Failed to convert text in header or query param 'mcmaTracker' to an McmaTracker object. Error: {e}");
                }
            }

            try
            {
                // if we didn't find it in the header or query string, try the body
                if (!(GetRequestBodyJson() is JObject jsonBody))
                    return null;

                var trackerProp = jsonBody.Properties().FirstOrDefault(j => j.Name.Equals(nameof(Job.Tracker), StringComparison.OrdinalIgnoreCase));

                return trackerProp?.Value.ToMcmaObject<McmaTracker>();
            }
            catch (Exception e)
            {
                LoggerProvider?.Get(RequestId)?.Warn($"Failed to parse McmaTracker object found in body's 'tracker' property. Error: {e}");
            }

            return null;
        }

        public ILogger GetLogger() => LoggerProvider?.Get(RequestId, GetTracker());
    }
}
