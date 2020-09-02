
using System.Threading.Tasks;
using Amazon.Lambda;
using Amazon.Lambda.Model;
using Mcma.Api;
using Mcma.Context;
using Mcma.Serialization;

namespace Mcma.Aws.Lambda
{
    public class LambdaWorkerInvoker : WorkerInvoker
    {
        public LambdaWorkerInvoker(IContextVariableProvider contextVariableProvider)
            : base(contextVariableProvider)
        {
        }

        protected override async Task InvokeAsync(string workerFunctionId, WorkerRequest request)
        {
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