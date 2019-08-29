using System.Threading.Tasks;
using Mcma.Core.Serialization;
using Mcma.Worker;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Newtonsoft.Json.Linq;

namespace Mcma.Azure.Functions.Worker
{
    public static class HttpRequestExtensions
    {
        public static async Task<WorkerRequest> ToWorkerRequestAsync(this HttpRequest httpRequest)
            => JObject.Parse(await httpRequest.ReadAsStringAsync()).ToMcmaObject<WorkerRequest>();
    }
}
