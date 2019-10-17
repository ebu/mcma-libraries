using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mcma.Core.Logging;

namespace Mcma.Worker
{
    internal class Worker : IWorker
    {
        internal Worker(IEnumerable<IWorkerOperationFilter> operations)
        {
            OperationFilters = operations?.ToArray() ?? new IWorkerOperationFilter[0];
        }

        private IWorkerOperationFilter[] OperationFilters { get; }

        public async Task DoWorkAsync(WorkerRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var operationFilter = OperationFilters.FirstOrDefault(oh => oh.Filter(request));
            if (operationFilter == null)
                throw new Exception($"No handler found for '{request.OperationName}' that can handle this request.");

            request.Logger.Debug("Handling worker operation '" + request.OperationName + "' with handler of type '" + operationFilter.GetType().Name + "'");
            
            try
            {
                await operationFilter.Handler.ExecuteAsync(request);
            }
            catch (Exception ex)
            {
                request.Logger.Error($"Failed to process worker operation '{request.OperationName}'.");
                request.Logger.Exception(ex);
                
                throw;
            }
        }
    }
}
