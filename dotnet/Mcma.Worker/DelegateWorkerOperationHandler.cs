using System;
using System.Threading.Tasks;

namespace Mcma.Worker
{
    internal class DelegateWorkerOperationHandler<T> : WorkerOperationHandler<T>
    {
        public DelegateWorkerOperationHandler(Func<WorkerRequest, T, Task> executeAsync)
        {
            ExecuteAsyncFunc = executeAsync;
        }

        private Func<WorkerRequest, T, Task> ExecuteAsyncFunc { get; }

        protected override Task ExecuteAsync(WorkerRequest requestContext, T requestInput) => ExecuteAsyncFunc(requestContext, requestInput);
    }
}
