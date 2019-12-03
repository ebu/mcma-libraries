using System;
using System.Threading.Tasks;
using Mcma.Core;

namespace Mcma.Worker
{
    internal class DelegateJobProfile<TJob> : IJobProfile<TJob> where TJob : Job
    {
        public DelegateJobProfile(string name, Func<ProcessJobAssignmentHelper<TJob>, Task> handler)
        {
            Name = name;
            Handler = handler;
        }

        public string Name { get; }

        private Func<ProcessJobAssignmentHelper<TJob>, Task> Handler { get; }

        public Task ExecuteAsync(ProcessJobAssignmentHelper<TJob> job) => Handler(job);
    }
}
