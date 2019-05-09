using System;
using System.Threading.Tasks;

namespace Mcma.Worker.Builders
{
    internal class FilteredOperationHandlerBuilder<T>
    {
        internal FilteredOperationHandlerBuilder(
            string operationName,
            IWorkerOperationHandler handler,
            Func<WorkerRequest, bool> filter = null)
        {
            if (string.IsNullOrWhiteSpace(operationName)) throw new ArgumentNullException(nameof(operationName));
            if (handler == null) throw new ArgumentNullException(nameof(handler));

            OperationName = operationName;
            Handler = handler;
            Filter =
                request =>
                    request.TryGetInput(out T _) &&
                    OperationName.Equals(request.OperationName, StringComparison.OrdinalIgnoreCase) &&
                    (filter?.Invoke(request) ?? true);
        }

        private string OperationName { get; }

        private Func<WorkerRequest, bool> Filter { get; }

        private IWorkerOperationHandler Handler { get; }

        internal IWorkerOperationFilter Build()
        {
            if (Handler == null)
                throw new Exception($"Filter for operation {OperationName} does not have a handler.");
            
            return new WorkerOperationFilter(Filter, Handler);
        }
    }
}
