using System.Collections.Generic;
using System.Threading.Tasks;
using Mcma;

namespace Mcma.Worker
{
    public interface IJobProfile<TJob> where TJob : Job
    {
        string Name { get; }

        Task ExecuteAsync(ProviderCollection providerCollection, ProcessJobAssignmentHelper<TJob> workerJobHelper, WorkerRequestContext requestContext);
    }
}
