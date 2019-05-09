
using System.Threading.Tasks;
using Amazon.Lambda;
using Amazon.Lambda.Model;
using Mcma.Api;
using Mcma.Core;
using Mcma.Core.Logging;
using Mcma.Core.Serialization;

namespace Mcma.Aws.Lambda
{
    public class LambdaWorkerInvoker : IWorkerInvoker
    {
        public async Task RunAsync(string workerFunctionName, object payload)
        {
            Logger.Debug("Invoking worker with function name '" + workerFunctionName + "'...");
            
            // invoking worker lambda function that will handle the work for the service
            using (var lambdaClient = new AmazonLambdaClient())
                await lambdaClient.InvokeAsync(
                    new InvokeRequest
                    {
                        FunctionName = workerFunctionName,
                        InvocationType = "Event",
                        LogType = "None",
                        Payload = payload.ToMcmaJson().ToString()
                    }
                );
        }
    }
}