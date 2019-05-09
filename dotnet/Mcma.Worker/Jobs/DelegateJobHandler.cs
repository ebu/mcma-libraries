using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mcma.Core;

namespace Mcma.Worker
{
    internal class DelegateJobProfileHandler<T> : IJobProfileHandler<T> where T : Job
    {
        public DelegateJobProfileHandler(Func<WorkerJobHelper<T>, Task> handler)
        {
            Handler = handler;
        }

        private Func<WorkerJobHelper<T>, Task> Handler { get; }

        public Task RunAsync(WorkerJobHelper<T> job) => Handler(job);
    }
}
