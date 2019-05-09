using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mcma.Core;

namespace Mcma.Worker
{
    public interface IJobProfileHandler<T> where T : Job
    {
        Task RunAsync(WorkerJobHelper<T> job);
    }
}
