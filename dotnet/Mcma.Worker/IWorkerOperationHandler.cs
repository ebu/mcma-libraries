using System.Threading.Tasks;

namespace Mcma.Worker
{
    public interface IWorkerOperationHandler
    {
        Task ExecuteAsync(WorkerRequest requestContext);
    }
}
