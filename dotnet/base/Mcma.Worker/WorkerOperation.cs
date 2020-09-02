using System;
using System.Threading.Tasks;

namespace Mcma.Worker
{
    public abstract class WorkerOperation<T> : IWorkerOperation
    {
        protected WorkerOperation(ProviderCollection providerCollection)
        {
            ProviderCollection = providerCollection;
        }

        protected ProviderCollection ProviderCollection { get; }

        public abstract string Name { get; }

        public Type InputType => typeof(T);

        private bool IsValidRequest(WorkerRequestContext reqCtx)
            => Name.Equals(reqCtx.OperationName, StringComparison.OrdinalIgnoreCase) && reqCtx.TryGetInputAs<T>(out _);

        bool IWorkerOperation.Accepts(WorkerRequestContext reqCtx) => IsValidRequest(reqCtx) && Accepts(reqCtx);

        protected virtual bool Accepts(WorkerRequestContext reqCtx) => true;

        Task IWorkerOperation.ExecuteAsync(WorkerRequestContext requestContext)
        {
            if (requestContext == null)
                throw new ArgumentNullException(nameof(requestContext));

            var input = requestContext.GetInputAs<T>();

            requestContext.Logger?.Debug("Got input of type '" + typeof(T).Name + "' from worker request.");
            
            return ExecuteAsync(requestContext, input);
        }

        protected abstract Task ExecuteAsync(WorkerRequestContext requestContext, T requestInput);
    }
}
