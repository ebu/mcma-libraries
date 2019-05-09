using System;

namespace Mcma.Worker
{
    internal interface IWorkerOperationFilter
    {
        Func<WorkerRequest, bool> Filter { get; }

        IWorkerOperationHandler Handler { get; }
    }
}
