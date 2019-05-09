using System;
using System.Threading.Tasks;
using Mcma.Core.Logging;
using Mcma.Core.Serialization;

namespace Mcma.Worker
{
    public abstract class WorkerOperationHandler<T> : IWorkerOperationHandler
    {
        Task IWorkerOperationHandler.ExecuteAsync(WorkerRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var input = request.GetInput<T>();

            Logger.Debug("Got input of type '" + typeof(T).Name + "' from worker request.");
            
            return ExecuteAsync(request, input);
        }

        protected abstract Task ExecuteAsync(WorkerRequest request, T requestInput);
    }
}
