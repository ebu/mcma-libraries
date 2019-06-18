using System;
using System.Collections.Generic;
using System.Linq;

namespace Mcma.Worker.Builders
{
    public class WorkerBuilder
    {
        private List<IOperationHandlerBuilder> OperationHandlerBuilders { get; } = new List<IOperationHandlerBuilder>();

        public WorkerBuilder HandleOperation<T>(string operationName, Action<OperationHandlerBuilder<T>> configureOperation)
        {
            var opHandlerBuilder = new OperationHandlerBuilder<T>(operationName);
            OperationHandlerBuilders.Add(opHandlerBuilder);
            configureOperation(opHandlerBuilder);
            return this;
        }

        public IWorker Build() => new Worker(OperationHandlerBuilders.SelectMany(r => r.Build()));
    }
}
