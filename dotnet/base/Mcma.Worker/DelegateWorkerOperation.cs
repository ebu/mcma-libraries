using System;
using System.Threading.Tasks;
using Mcma.Core.Logging;

namespace Mcma.Worker
{
    internal class DelegateWorkerOperation<T> : WorkerOperation<T>
    {
        public DelegateWorkerOperation(ProviderCollection providerCollection,
                                       string name,
                                       Func<WorkerRequest, T, Task> executeAsync,
                                       Func<WorkerRequest, bool> accepts = null)
            : base(providerCollection)
        {
            Name = name;
            ExecuteAsyncFunc = executeAsync;
            AcceptsFunc = accepts ?? (req => true);
        }

        public override string Name { get; }

        private Func<WorkerRequest, T, Task> ExecuteAsyncFunc { get; }

        private Func<WorkerRequest, bool> AcceptsFunc { get; }

        protected override bool Accepts(WorkerRequest req) => AcceptsFunc(req);

        protected override Task ExecuteAsync(WorkerRequest requestContext, T requestInput) => ExecuteAsyncFunc(requestContext, requestInput);
    }
}
