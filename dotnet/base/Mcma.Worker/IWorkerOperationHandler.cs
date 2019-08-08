using System;
using System.Threading.Tasks;

namespace Mcma.Worker
{
    public interface IWorkerOperationHandler
    {
        Type InputType { get; }

        Task ExecuteAsync(WorkerRequest request);
    }

    public interface IWorkerOperationHandler<T> : IWorkerOperationHandler
    {
    }
}
