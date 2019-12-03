using System;
using System.Threading.Tasks;
using Mcma.Api;
using Mcma.Core.Context;
using Mcma.Core.Serialization;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Queue;

namespace Mcma.Azure.Functions.Api
{
    public class QueueWorkerInvoker : WorkerInvoker
    {
        public QueueWorkerInvoker(IContextVariableProvider contextVariableProvider)
            : base(contextVariableProvider)
        {
        }

        protected override async Task InvokeAsync(string workerFunctionId, WorkerRequest request)
        {
            var appStorageConnectionString = ContextVariableProvider.GetRequiredContextVariable("WEBSITE_CONTENTAZUREFILECONNECTIONSTRING");
            if (!CloudStorageAccount.TryParse(appStorageConnectionString, out var appStorageAccount))
                throw new Exception($"Failed to parse app storage connection string '{appStorageConnectionString}'.");

            await appStorageAccount.CreateCloudQueueClient()
                .GetQueueReference(workerFunctionId)
                .AddMessageAsync(new CloudQueueMessage(request.ToMcmaJson().ToString()));
        }
    }
}
