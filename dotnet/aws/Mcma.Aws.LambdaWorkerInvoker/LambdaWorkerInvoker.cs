
using System.Threading.Tasks;
using Amazon.Lambda;
using Amazon.Lambda.Model;
using Mcma.Api;
using Mcma.Core.Context;
using Mcma.Core.Logging;
using Mcma.Core.Serialization;

namespace Mcma.Aws.Lambda
{
    public class LambdaWorkerInvoker : WorkerInvoker
    {
        public LambdaWorkerInvoker(IContext context)
            : base(context)
        {
        }

        protected override async Task InvokeAsync(string workerFunctionId, WorkerRequest request)
        {
            Context.Logger.Debug("Invoking worker with function name '" + workerFunctionId + "'...");
            
            // invoking worker lambda function that will handle the work for the service
            using (var lambdaClient = new AmazonLambdaClient())
                await lambdaClient.InvokeAsync(
                    new InvokeRequest
                    {
                        FunctionName = workerFunctionId,
                        InvocationType = "Event",
                        LogType = "None",
                        Payload = request.ToMcmaJson().ToString()
                    }
                );
        }
    }
}