using System;
using System.Threading.Tasks;
using Mcma.Client;
using Mcma.Core;
using Mcma.Data;
using Mcma.Worker.Builders;

namespace Mcma.Worker
{
    public class JobHandlerBuilder<T> where T : Job
    {
        internal JobHandlerBuilder(
            WorkerBuilder workerBuilder,
            IDbTableProvider dbTableProvider,
            IResourceManagerProvider resourceManagerProvider)
        {
            WorkerBuilder = workerBuilder;
            Handler = new ProcessJobAssignment<T>(dbTableProvider, resourceManagerProvider);
        }

        private WorkerBuilder WorkerBuilder { get; }

        private ProcessJobAssignment<T> Handler { get; }

        public JobHandlerBuilder<T> AddProfile<THandler>(string profileName = null) where THandler : IJobProfileHandler<T>, new()
            => AddProfile(profileName ?? typeof(THandler).Name, new THandler());

        public JobHandlerBuilder<T> AddProfile(string profileName, Func<WorkerJobHelper<T>, Task> profileHandler)
            => AddProfile(profileName, new DelegateJobProfileHandler<T>(profileHandler));

        public JobHandlerBuilder<T> AddProfile(string profileName, IJobProfileHandler<T> profileHandler)
        {
            Handler.ProfileHandlers[profileName] = profileHandler;
            return this;
        }

        internal WorkerBuilder Apply() => WorkerBuilder.HandleOperation(Handler, "ProcessJobAssignment");
    }
}
