using System;
using System.Threading.Tasks;
using Mcma.Logging;

namespace Mcma.Worker
{
    internal class DelegateWorkerOperation<T> : WorkerOperation<T>
    {
        public DelegateWorkerOperation(ProviderCollection providerCollection,
                                       string name,
                                       Func<WorkerRequestContext, T, Task> executeAsync,
                                       Func<WorkerRequestContext, bool> accepts = null)
            : base(providerCollection)
        {
            Name = name;
            ExecuteAsyncFunc = executeAsync;
            AcceptsFunc = accepts ?? (req => true);
        }

        public override string Name { get; }

        private Func<WorkerRequestContext, T, Task> ExecuteAsyncFunc { get; }

        private Func<WorkerRequestContext, bool> AcceptsFunc { get; }

        protected override bool Accepts(WorkerRequestContext reqCtx) => AcceptsFunc(reqCtx);

        protected override Task ExecuteAsync(WorkerRequestContext requestContext, T requestInput) => ExecuteAsyncFunc(requestContext, requestInput);
    }
}
