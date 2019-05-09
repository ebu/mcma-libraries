using System;
using System.Collections.Generic;
using System.Linq;

namespace Mcma.Worker.Builders
{
    public class WorkerBuilder
    {
        internal WorkerBuilder()
        {
            
        }

        private List<IRequestHandlerBuilder> RequestHandlerBuilders { get; } = new List<IRequestHandlerBuilder>();

        public WorkerBuilder HandleRequestsOfType<T>(Action<RequestHandlerBuilder<T>> configureRequestType)
        {
            var requestHandlerBuilder = new RequestHandlerBuilder<T>();
            RequestHandlerBuilders.Add(requestHandlerBuilder);
            configureRequestType(requestHandlerBuilder);
            return this;
        }

        public IWorker Build() => new Worker(RequestHandlerBuilders.SelectMany(r => r.Build()));
    }
}
