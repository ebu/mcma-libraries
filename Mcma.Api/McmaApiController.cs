using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Routing;
using Newtonsoft.Json.Linq;
using Mcma.Core.Serialization;
using Mcma.Core.Logging;

namespace Mcma.Api
{
    public class McmaApiController<TRequest> where TRequest : McmaApiRequest
    {
        private List<McmaApiRoute<TRequest>> Routes { get; } = new List<McmaApiRoute<TRequest>>();

        private IDictionary<string, string> GetDefaultResponseHeaders()
            => new Dictionary<string, string>
            {
                ["Date"] = DateTime.UtcNow.ToString(),
                ["Content-Type"] = "application/json",
                ["Access-Control-Allow-Origin"] = "*"
            };

        public void AddRoute(string method, string path, Func<TRequest, McmaApiResponse, Task> handler)
        {
            Routes.Add(new McmaApiRoute<TRequest>(method, path, handler));
        }

        public async Task<McmaApiResponse> HandleRequestAsync(TRequest request)
        {
            var response = new McmaApiResponse
            {
                StatusCode = (int)HttpStatusCode.OK,
                StatusMessage = null,
                Headers = GetDefaultResponseHeaders(),
                JsonBody = null
            };

            var pathMatched = false;
            var methodMatched = false;

            try
            {
                var requestBodyOk = true;

                if (!string.IsNullOrEmpty(request.Body))
                {
                    try
                    {
                        request.JsonBody = JObject.Parse(request.Body);
                    }
                    catch (Exception ex)
                    {
                        response.StatusCode = (int)HttpStatusCode.BadRequest;
                        response.JsonBody = new McmaApiError(response.StatusCode, ex.ToString(), request.Path).ToMcmaJson();
                        requestBodyOk = false;
                    }
                }

                if (requestBodyOk)
                {
                    var methodsAllowed = string.Empty;

                    foreach (var route in Routes)
                    {
                        var pathVariables = new RouteValueDictionary();
                        if (route.Template.TryMatch(request.Path, pathVariables))
                        {
                            pathMatched = true;

                            if (methodsAllowed.Length > 0)
                                methodsAllowed += ", ";
                            methodsAllowed += request.HttpMethod;

                            if (route.HttpMethod == request.HttpMethod)
                            {
                                methodMatched = true;

                                request.PathVariables = pathVariables;

                                await route.Handler(request, response);
                                break;
                            }
                        }
                    }

                    if (!pathMatched)
                    {
                        response.StatusCode = (int)HttpStatusCode.NotFound;
                        response.Headers = GetDefaultResponseHeaders();
                        response.JsonBody = new McmaApiError(response.StatusCode, "Resource not found on path '" + request.Path + "'.", request.Path).ToMcmaJson();
                    }
                    else if (!methodMatched)
                    {
                        if (!methodsAllowed.Contains("OPTIONS"))
                        {
                            if (methodsAllowed.Length > 0)
                                methodsAllowed += ", ";
                            methodsAllowed += "OPTIONS";
                        }

                        if (request.HttpMethod == "OPTIONS")
                        {
                            response.StatusCode = (int)HttpStatusCode.OK;
                            response.Headers = GetDefaultResponseHeaders();

                            string corsMethod = null;
                            string corsHeaders = null;

                            foreach (var prop in request.Headers.Keys)
                            {
                                if (prop.ToLower() == "access-control-request-method")
                                    corsMethod = request.Headers[prop];
                                if (prop.ToLower() == "access-control-request-headers")
                                    corsHeaders = request.Headers[prop];
                            }

                            if (corsMethod != null)
                            {
                                response.Headers["Access-Control-Allow-Methods"] = methodsAllowed;

                                if (corsHeaders != null)
                                    response.Headers["Access-Control-Allow-Headers"] = corsHeaders;
                            }
                            else
                                response.Headers["Allow"] = methodsAllowed;
                        }
                        else
                        {
                            response.StatusCode = (int)HttpStatusCode.MethodNotAllowed;
                            response.Headers = GetDefaultResponseHeaders();
                            response.Headers["Allow"] = methodsAllowed;
                            response.JsonBody = new McmaApiError(response.StatusCode, "Method '" + request.HttpMethod + "' not allowed on path '" + request.Path, request.Path).ToMcmaJson();
                        }
                    }
                    else if ((response.StatusCode / 200 << 0) * 200 == 400)
                    {
                        response.Headers = GetDefaultResponseHeaders();
                        response.JsonBody = new McmaApiError(response.StatusCode, response.StatusMessage, request.Path).ToMcmaJson();
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.Error(ex.ToString());

                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.Headers = GetDefaultResponseHeaders();
                response.JsonBody = new McmaApiError(response.StatusCode, ex.ToString(), request.Path).ToMcmaJson();
            }

            if (response.JsonBody != null)
                response.Body = response.JsonBody.ToString();

            return response;
        }
    }
}
