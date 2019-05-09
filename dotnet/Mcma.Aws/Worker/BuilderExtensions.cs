using System;
using Mcma.Aws.DynamoDb;
using Mcma.Core;
using Mcma.Worker;
using Mcma.Worker.Builders;

namespace Mcma.Aws.Worker
{
    public static class BuilderExtensions
    {
        public static WorkerBuilder HandleJobsOfType<T>(this WorkerBuilder workerBuilder, Action<JobHandlerBuilder<T>> configure) where T : Job
            => workerBuilder.HandleJobsOfType<T>(new DynamoDbTableProvider<JobAssignment>(), new AwsWorkerResourceManagerProvider(), configure);
    }
}