using System;
using Mcma.Core;
using Mcma.Worker;

namespace Mcma.Aws.Worker
{
    public class AwsWorkerResourceManagerProvider : IWorkerResourceManagerProvider
    {
        public ResourceManager GetResourceManager(WorkerRequest request) => request.GetAwsV4ResourceManager();
    }
}