using System.Collections.Generic;
using System.Threading.Tasks;
using Mcma;

namespace Mcma.Api
{
    public delegate Task InvokeWorker(string workerFunctionId, WorkerRequest request);

    public interface IWorkerInvoker
    {
        Task InvokeAsync(
            string workerFunctionId,
            string operationName,
            IDictionary<string, string> contextVariables = null,
            object input = null,
            McmaTracker tracker = null);
    }
}
