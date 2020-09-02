using System;
using System.Threading.Tasks;
using Mcma;

namespace Mcma.Worker
{
    internal class DelegateJobProfile<TJob> : IJobProfile<TJob> where TJob : Job
    {
        public DelegateJobProfile(string name, Func<ProviderCollection, ProcessJobAssignmentHelper<TJob>, WorkerRequestContext, Task> handler)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Handler = handler ?? throw new ArgumentNullException(nameof(handler));
        }

        public string Name { get; }

        private Func<ProviderCollection, ProcessJobAssignmentHelper<TJob>, WorkerRequestContext, Task> Handler { get; }

        public Task ExecuteAsync(ProviderCollection providerCollection,
                                 ProcessJobAssignmentHelper<TJob> workerJobHelper,
                                 WorkerRequestContext requestContext)
            => Handler(providerCollection, workerJobHelper, requestContext);
    }
}
