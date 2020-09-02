using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Mcma.Api;
using Mcma.Azure.Client;
using Mcma.Context;
using Mcma.Serialization;

namespace Mcma.Azure.Functions.Api
{
    public class HttpWorkerInvoker : WorkerInvoker
    {
        public HttpWorkerInvoker(IContextVariableProvider contextVariableProvider)
            : base(contextVariableProvider)
        {
        }

        private HttpClient HttpClient { get; } = new HttpClient();

        protected override async Task InvokeAsync(string workerFunctionId, WorkerRequest request)
        {
            // create a POST request with the worker request as the body
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, workerFunctionId)
            {
                Content = new StringContent(request.ToMcmaJson().ToString(), Encoding.UTF8, "application/json")
            };

            // if we have a function key
            var functionKey = ContextVariableProvider.GetOptionalContextVariable("WorkerFunctionKey");
            if (functionKey != null)
                httpRequest.Headers.Add(AzureConstants.FunctionKeyHeader, functionKey);

            // send the request
            var resp = await HttpClient.SendAsync(httpRequest);
            
            resp.EnsureSuccessStatusCode();
        }
    }
}
