using System.Collections.Generic;
using System.Threading.Tasks;
using Mcma.Core.Context;

namespace Mcma.Api
{
    public abstract class WorkerInvoker : IWorkerInvoker
    {
        protected WorkerInvoker(IContextVariableProvider contextVariableProvider)
        {
            ContextVariableProvider = contextVariableProvider;
        }

        protected IContextVariableProvider ContextVariableProvider { get; }

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
