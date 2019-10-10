using System.Collections.Generic;
using System.Threading.Tasks;

namespace Mcma.Api
{
    public abstract class WorkerInvoker : IWorkerInvoker
    {
        public Task InvokeAsync(string workerFunctionId, string operationName, IDictionary<string, string> contextVariables = null, object input = null)
            =>
            InvokeAsync(
                workerFunctionId,
                new WorkerRequest
                {
                    OperationName = operationName,
                    ContextVariables = contextVariables ?? new Dictionary<string, string>(),
                    Input = input}
                );

        protected abstract Task InvokeAsync(string workerFunctionId, WorkerRequest workerRequest);
    }
}
