using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
                                           Func<WorkerRequestContext, TInput, Task> handler,
                                           Func<WorkerRequestContext, bool> accepts = null)
            => AddOperation(new DelegateWorkerOperation<TInput>(ProviderCollection, operationName, handler, accepts));

        public Worker AddOperation(IWorkerOperation operation)
        {
            var existing = Operations.FirstOrDefault(op => op.Name.Equals(operation.Name, StringComparison.OrdinalIgnoreCase));
            if (existing != null)
                throw new Exception($"Cannot add duplicate operation with name '{operation.Name}'");

            Operations.Add(operation);

            return this;
        }

        public async Task DoWorkAsync(WorkerRequestContext requestContext)
        {
            if (requestContext == null)
                throw new ArgumentNullException(nameof(requestContext));

            var operation = Operations.FirstOrDefault(op => op.Accepts(requestContext));
            if (operation == null)
                throw new McmaException($"No handler found for '{requestContext.OperationName}' that can handle this request.");

            requestContext.Logger?.Debug("Handling worker operation '" + requestContext.OperationName + "' with handler of type '" + operation.GetType().Name + "'");
            
            try
            {
                await operation.ExecuteAsync(requestContext);
            }
            catch (Exception ex)
            {
                requestContext.Logger?.Error($"Failed to process worker operation '{requestContext.OperationName}'. Exception: {ex}");
                throw;
            }
        }
    }
}
