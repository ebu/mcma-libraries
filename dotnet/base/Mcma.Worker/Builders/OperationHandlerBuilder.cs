using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Mcma.Worker.Builders
{
    public class OperationHandlerBuilder : IOperationHandlerBuilder
    {
        internal OperationHandlerBuilder(Type inputType, string operationName)
        {
            InputType = inputType;
            OperationName = operationName;
        }

        protected Type InputType { get; }

        internal string OperationName { get; }

        private Dictionary<string, FilteredOperationHandlerBuilder> Filters { get; } = new Dictionary<string, FilteredOperationHandlerBuilder>();

        public OperationHandlerBuilder Handle(IWorkerOperationHandler handler, Expression<Func<WorkerRequest, bool>> filter = null)
        {
            var filteredOpHandler = new FilteredOperationHandlerBuilder(InputType, OperationName, handler, filter?.Compile());
            Filters[filter?.ToString() ?? string.Empty] = filteredOpHandler;
            return this;
        }

        IEnumerable<IWorkerOperationFilter> IOperationHandlerBuilder.Build() => Filters.Values.Select(f => f.Build());
    }

    public class OperationHandlerBuilder<T> : OperationHandlerBuilder
    {
        public OperationHandlerBuilder(string operationName)
            : base(typeof(T), operationName)
        {   
        }
    }
}
