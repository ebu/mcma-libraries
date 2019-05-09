using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Mcma.Core.Logging;

namespace Mcma.Worker
{
    internal class Worker : IWorker
    {
        internal Worker(IEnumerable<IWorkerOperationFilter> operations)
        {
            OperationHandlers = operations?.ToArray() ?? new IWorkerOperationFilter[0];
        }

        private IWorkerOperationFilter[] OperationHandlers { get; }

        public async Task DoWorkAsync(WorkerRequest requestContext)
        {
            var operationHandler = OperationHandlers.FirstOrDefault(oh => oh.Filter(requestContext))?.Handler;
            if (operationHandler == null)
                throw new Exception($"No handler found for '{requestContext.OperationName}' that can handle this request.");

            Logger.Debug("Handling worker operation '" + requestContext.OperationName + "' with handler of type '" + operationHandler.GetType().Name + "'");
            
            try
            {
                await operationHandler.ExecuteAsync(requestContext);
            }
            catch (Exception ex)
            {
                Logger.Error($"Failed to process worker operation '{requestContext.OperationName}'.");
                Logger.Exception(ex);
                
                throw;
            }
        }
    }
}
