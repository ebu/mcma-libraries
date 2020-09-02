using System;
using System.Threading.Tasks;

namespace Mcma.Worker
{
    public interface IWorkerOperation
    {
        string Name { get; }
        
        bool Accepts(WorkerRequestContext request);

        Task ExecuteAsync(WorkerRequestContext request);
    }
}
