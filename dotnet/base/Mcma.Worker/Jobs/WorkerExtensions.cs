using System;
using Mcma.Core;

namespace Mcma.Worker
{
    public static class WorkerExtensions
    {
        public static Worker AddJobProcessing<TJob>(this Worker worker, Action<ProcessJobAssignmentOperation<TJob>> addProfiles) where TJob: Job
        {
            var operation = new ProcessJobAssignmentOperation<TJob>(worker.ProviderCollection);
            addProfiles(operation);

            if (operation.Profiles.Count == 0)
                throw new Exception($"No profiles registered for job type {typeof(TJob).Name}.");

            return worker;
        }
    }
}
