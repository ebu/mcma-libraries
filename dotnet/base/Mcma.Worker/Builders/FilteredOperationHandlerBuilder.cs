using System;

namespace Mcma.Worker.Builders
{
    internal class FilteredOperationHandlerBuilder
    {
        internal FilteredOperationHandlerBuilder(
            Type type,
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
                    request.TryGetInput(type, out var input) &&
                    OperationName.Equals(request.OperationName, StringComparison.OrdinalIgnoreCase) &&
                    (filter?.Invoke(request) ?? true);
        }

        private string OperationName { get; }

        private Func<WorkerRequest, bool> Filter { get; }

        private IWorkerOperationHandler Handler { get; }

        internal IWorkerOperationFilter Build() => new WorkerOperationFilter(Filter, Handler);
    }
}
