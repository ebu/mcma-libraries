using System;
using Mcma.Core;
using Mcma.Data;
using Mcma.Worker.Builders;

namespace Mcma.Worker
{
    public static class BuilderExtensions
    {
        public static WorkerBuilder HandleJobsOfType<T>(
            this WorkerBuilder workerBuilder,
            IDbTableProvider<JobAssignment> dbTableProvider,
            IWorkerResourceManagerProvider resourceManagerProvider,
            Action<JobHandlerBuilder<T>> configure) where T : Job
        {
            var jobHandlerBuilder = new JobHandlerBuilder<T>(workerBuilder, dbTableProvider, resourceManagerProvider);
            configure(jobHandlerBuilder);
            return jobHandlerBuilder.Apply();
        }
    }
}
