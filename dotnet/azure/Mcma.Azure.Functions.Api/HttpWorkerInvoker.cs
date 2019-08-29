using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Mcma.Api;
using Mcma.Core.Serialization;

namespace Mcma.Azure.Functions.Api
{
    public class HttpWorkerInvoker : WorkerInvoker
    {
        private HttpClient HttpClient { get; } = new HttpClient();

        protected override async Task InvokeAsync(string workerFunctionId, WorkerRequest request)
            => await HttpClient.PostAsync(workerFunctionId, new StringContent(request.ToMcmaJson().ToString(), Encoding.UTF8, "application/json"));
    }
}
