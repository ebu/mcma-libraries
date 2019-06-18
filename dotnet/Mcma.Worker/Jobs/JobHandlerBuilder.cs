using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mcma.Core;
using Mcma.Data;
using Mcma.Worker.Builders;

namespace Mcma.Worker
{
    public class JobHandlerBuilder<T> where T : Job
    {
        internal JobHandlerBuilder(
            WorkerBuilder workerBuilder,
            IDbTableProvider<JobAssignment> dbTableProvider,
            IWorkerResourceManagerProvider resourceManagerProvider)
        {
            WorkerBuilder = workerBuilder;
            Handler = new ProcessJobAssignmentHandler<T>(dbTableProvider, resourceManagerProvider);
        }

        private WorkerBuilder WorkerBuilder { get; }

        private ProcessJobAssignmentHandler<T> Handler { get; }

        public JobHandlerBuilder<T> AddProfile<THandler>(string profileName) where THandler : IJobProfileHandler<T>, new()
            => AddProfile(profileName, new THandler());

        public JobHandlerBuilder<T> AddProfile(string profileName, Func<WorkerJobHelper<T>, Task> profileHandler)
            => AddProfile(profileName, new DelegateJobProfileHandler<T>(profileHandler));

        public JobHandlerBuilder<T> AddProfile(string profileName, IJobProfileHandler<T> profileHandler)
        {
            Handler.ProfileHandlers[profileName] = profileHandler;
            return this;
        }

        internal WorkerBuilder Apply()
            => WorkerBuilder.HandleOperation<ProcessJobAssignment>(
                ProcessJobAssignment.OperationName,
                configureOperation => configureOperation.Handle(Handler));
    }
}
