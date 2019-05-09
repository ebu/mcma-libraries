using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Mcma.Worker.Builders
{
    public class OperationHandlerBuilder<T>
    {
        internal OperationHandlerBuilder(string operationName)
        {
            OperationName = operationName;
        }

        internal string OperationName { get; }

        private Dictionary<string, FilteredOperationHandlerBuilder<T>> Filters { get; } = new Dictionary<string, FilteredOperationHandlerBuilder<T>>();

        public OperationHandlerBuilder<T> Handle(Func<WorkerRequest, T, Task> handler, Expression<Func<WorkerRequest, bool>> filter = null)
            => Handle(new DelegateWorkerOperationHandler<T>(handler), filter);

        public OperationHandlerBuilder<T> Handle<THandler>(Expression<Func<WorkerRequest, bool>> filter = null)
            where THandler : WorkerOperationHandler<T>, new()
            => Handle(new THandler(), filter);

        public OperationHandlerBuilder<T> Handle(IWorkerOperationHandler handler, Expression<Func<WorkerRequest, bool>> filter = null)
        {
            var filteredOpHandler = new FilteredOperationHandlerBuilder<T>(OperationName, handler, filter?.Compile());
            Filters[filter?.ToString() ?? string.Empty] = filteredOpHandler;
            return this;
        }

        internal IEnumerable<IWorkerOperationFilter> Build() => Filters.Values.Select(f => f.Build());
    }
}
