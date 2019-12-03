using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mcma.Core.Logging;

namespace Mcma.Worker
{
    public class Worker : IWorker
    {
        public Worker(ProviderCollection providerCollection)
        {
            ProviderCollection = providerCollection;
        }

        internal ProviderCollection ProviderCollection { get; }

        private List<IWorkerOperation> Operations { get; } = new List<IWorkerOperation>();

        public Worker AddOperation<TOperation>() where TOperation : IWorkerOperation, new()
            => AddOperation(new TOperation());

        public Worker AddOperation<TInput>(string operationName,
                                           Func<WorkerRequest, TInput, Task> handler,
                                           Func<WorkerRequest, bool> accepts = null)
            => AddOperation(new DelegateWorkerOperation<TInput>(ProviderCollection, operationName, handler, accepts));

        public Worker AddOperation(IWorkerOperation operation)
        {
            var existing = Operations.FirstOrDefault(op => op.Name.Equals(operation.Name, StringComparison.OrdinalIgnoreCase));
            if (existing != null)
                throw new Exception($"Cannot add duplicate operation with name '{operation.Name}'");

            Operations.Add(operation);

            return this;
        }

        public async Task DoWorkAsync(WorkerRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var operation = Operations.FirstOrDefault(op => op.Accepts(request));
            if (operation == null)
                throw new Exception($"No handler found for '{request.OperationName}' that can handle this request.");
                
            var logger = ProviderCollection.LoggerProvider.Get(request.Tracker);
            logger.Debug("Handling worker operation '" + request.OperationName + "' with handler of type '" + operation.GetType().Name + "'");
            
            try
            {
                await operation.ExecuteAsync(request);
            }
            catch (Exception ex)
            {
                logger.Error($"Failed to process worker operation '{request.OperationName}'. Exception: {ex}");
                throw;
            }
        }
    }
}
