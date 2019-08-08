using System;
using System.Collections.Generic;
using System.Linq;

namespace Mcma.Worker.Builders
{
    public class WorkerBuilder
    {
        private List<IOperationHandlerBuilder> OperationHandlerBuilders { get; } = new List<IOperationHandlerBuilder>();

        public WorkerBuilder HandleOperation<THandler>(string operationName = null) where THandler : IWorkerOperationHandler, new()
            => HandleOperation(new THandler(), operationName);

        public WorkerBuilder HandleOperation<THandler>(THandler handler, string operationName = null) where THandler : IWorkerOperationHandler
            => HandleOperation(handler.InputType, operationName ?? typeof(THandler).Name, x => x.Handle(handler));

        public WorkerBuilder HandleOperation(Type inputType, string operationName, Action<OperationHandlerBuilder> configureOperation)
        {
            var opHandlerBuilder = new OperationHandlerBuilder(inputType, operationName);
            OperationHandlerBuilders.Add(opHandlerBuilder);
            configureOperation(opHandlerBuilder);
            return this;
        }

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
