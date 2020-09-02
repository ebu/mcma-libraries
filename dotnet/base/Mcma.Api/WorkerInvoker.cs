using System.Collections.Generic;
using System.Threading.Tasks;
using Mcma;
using Mcma.Context;

namespace Mcma.Api
{
    public abstract class WorkerInvoker : IWorkerInvoker
    {
        protected WorkerInvoker(IContextVariableProvider contextVariableProvider)
        {
            ContextVariableProvider = contextVariableProvider;
        }

        protected IContextVariableProvider ContextVariableProvider { get; }

        public Task InvokeAsync(string workerFunctionId, string operationName, IDictionary<string, string> contextVariables = null, object input = null, McmaTracker tracker = null)
            =>
            InvokeAsync(
                workerFunctionId,
                new WorkerRequest
                {
                    OperationName = operationName,
                    ContextVariables = contextVariables ?? new Dictionary<string, string>(),
                    Input = input,
                    Tracker = tracker
                }
            );

        protected abstract Task InvokeAsync(string workerFunctionId, WorkerRequest workerRequest);
    }
}
