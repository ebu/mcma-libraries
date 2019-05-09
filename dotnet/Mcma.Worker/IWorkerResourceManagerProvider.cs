using Mcma.Core;

namespace Mcma.Worker
{
    public interface IWorkerResourceManagerProvider
    {
        ResourceManager GetResourceManager(WorkerRequest request);
    }
}
