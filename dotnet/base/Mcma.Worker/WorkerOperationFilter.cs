using System;

namespace Mcma.Worker
{
    internal class WorkerOperationFilter : IWorkerOperationFilter
    {
        internal WorkerOperationFilter(Func<WorkerRequest, bool> filter, IWorkerOperationHandler handler)
        {
            Filter = filter;
            Handler = handler;
        }

        public Func<WorkerRequest, bool> Filter { get; }

        public IWorkerOperationHandler Handler { get; }
    }
}
