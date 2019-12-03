using System;
using System.Threading.Tasks;
using Mcma.Core.Logging;

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

        private bool IsValidRequest(WorkerRequest req)
            => Name.Equals(req.OperationName, StringComparison.OrdinalIgnoreCase) && req.TryGetInput<T>(out var _);

        bool IWorkerOperation.Accepts(WorkerRequest req) => IsValidRequest(req) && Accepts(req);

        protected virtual bool Accepts(WorkerRequest req) => true;

        Task IWorkerOperation.ExecuteAsync(WorkerRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var input = request.GetInput<T>();

            var logger = ProviderCollection.LoggerProvider.Get(request.Tracker);
            logger.Debug("Got input of type '" + typeof(T).Name + "' from worker request.");
            
            return ExecuteAsync(request, input);
        }

        protected abstract Task ExecuteAsync(WorkerRequest request, T requestInput);
    }
}
