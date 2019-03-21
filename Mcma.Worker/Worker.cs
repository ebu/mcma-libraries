using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mcma.Core.Logging;

namespace Mcma.Worker
{
    public abstract class Worker<T> : IWorker<T>
    {
        protected Worker()
        {
            OperationsCaseInsensitive =
                new Lazy<IDictionary<string, Func<T, Task>>>(() => new Dictionary<string, Func<T, Task>>(Operations, StringComparer.OrdinalIgnoreCase));
        }

        protected abstract IDictionary<string, Func<T, Task>> Operations { get; }

        private Lazy<IDictionary<string, Func<T, Task>>> OperationsCaseInsensitive { get; }

        Task IWorker.DoWorkAsync(string operation, object request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (!(request is T typedRequest))
                throw new Exception($"Worker of type {GetType().Name} cannot accept request of type {request.GetType()}");

            return DoWorkAsync(operation, typedRequest);
        }

        public async Task DoWorkAsync(string operation, T request)
        {
            if (!OperationsCaseInsensitive.Value.ContainsKey(operation))
                throw new Exception(
                    $"Worker of type {GetType().Name} does not support the operation '{operation}'.{Environment.NewLine}" +
                    $"Supported operations are:{Environment.NewLine}{string.Join(", ", OperationsCaseInsensitive.Value.Keys)}");
            
            try
            {
                await OperationsCaseInsensitive.Value[operation](request);
            }
            catch (Exception ex)
            {
                Logger.Error($"{GetType().Name} failed to process event.");
                Logger.Exception(ex);
                
                throw;
            }
        }
    }
}
