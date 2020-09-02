using Mcma.Serialization;
using Mcma.Worker;
using Microsoft.WindowsAzure.Storage.Queue;
using Newtonsoft.Json.Linq;

namespace Mcma.Azure.Functions.Worker
{
    public static class CloudQueueMessageExtensions
    {
        public static WorkerRequest ToWorkerRequest(this CloudQueueMessage queueMessage)
            => JObject.Parse(queueMessage.AsString).ToMcmaObject<WorkerRequest>();
    }
}
