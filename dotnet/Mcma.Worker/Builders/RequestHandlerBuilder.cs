using System;
using System.Collections.Generic;
using System.Linq;

namespace Mcma.Worker.Builders
{
    public class RequestHandlerBuilder<T> : IRequestHandlerBuilder
    {
        internal RequestHandlerBuilder()
        {
        }

        private WorkerBuilder WorkerBuilder { get; }

        private List<OperationHandlerBuilder<T>> OperationHandlerBuilders { get; } = new List<OperationHandlerBuilder<T>>();

        public RequestHandlerBuilder<T> WithOperation(string operationName, Action<OperationHandlerBuilder<T>> configureOperation)
        {
            var opHandlerBuilder = new OperationHandlerBuilder<T>(operationName);
            OperationHandlerBuilders.Add(opHandlerBuilder);
            configureOperation(opHandlerBuilder);
            return this;
        }

        IEnumerable<IWorkerOperationFilter> IRequestHandlerBuilder.Build() => OperationHandlerBuilders.SelectMany(ohb => ohb.Build());
    }
}
