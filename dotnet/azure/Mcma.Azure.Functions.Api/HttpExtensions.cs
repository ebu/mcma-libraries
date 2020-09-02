using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Mcma.Api;
using Mcma.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs.Extensions.Http;

namespace Mcma.Azure.Functions.Api
{
    public static class HttpExtensions
    {
        public static async Task<McmaApiRequestContext> ToMcmaApiRequestContextAsync(
            this HttpRequest request,
            IContextVariableProvider contextVariableProvider = null)
            => new McmaApiRequestContext(
                await request.ToMcmaApiRequestAsync(),
                (contextVariableProvider ?? new EnvironmentVariableProvider()).GetAllContextVariables().ToDictionary());

        public static async Task<McmaApiRequest> ToMcmaApiRequestAsync(this HttpRequest request)
            => new McmaApiRequest
            {
                Path = request.Path,
                HttpMethod = new HttpMethod(request.Method),
                Headers = request.Headers.Keys.ToDictionary(k => k, k => request.Headers[k].ToString()),
                PathVariables = new Dictionary<string, object>(),
                QueryStringParameters = request.Query.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.ToString()),
                Body = await request.ReadAsStringAsync()
            };

        public static IActionResult ToActionResult(this McmaApiRequestContext requestContext)
            => requestContext.Response.ToActionResult();

        public static IActionResult ToActionResult(this McmaApiResponse response)
            => new McmaApiActionResult(response);

        public static async Task CopyToHttpResponseAsync(this McmaApiResponse mcmaResponse, HttpResponse httpResponse)
        {
            httpResponse.StatusCode = mcmaResponse.StatusCode;

            if (mcmaResponse.Headers != null)
                foreach (var header in mcmaResponse.Headers)
                    httpResponse.Headers[header.Key] = header.Value;

            if (mcmaResponse.Body != null)
            {
                var body = Encoding.UTF8.GetBytes(mcmaResponse.Body);
                await httpResponse.Body.WriteAsync(body, 0, body.Length);
            }
        }
    }
}
