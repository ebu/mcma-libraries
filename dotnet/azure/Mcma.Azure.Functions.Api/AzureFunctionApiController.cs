using System.Threading.Tasks;
using Mcma.Api;
using Mcma.Api.Routes;
using Mcma.Azure.Functions.Logging;
using Mcma.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

namespace Mcma.Azure.Functions.Api
{
    public class AzureFunctionApiController
    {
        public AzureFunctionApiController(McmaApiRouteCollection routeCollection, MicrosoftLoggerProvider loggerProvider = null)
        {
            McmaApiController = new McmaApiController(routeCollection, loggerProvider);
            LoggerProvider = loggerProvider;
        }

        private McmaApiController McmaApiController { get; }

        private MicrosoftLoggerProvider LoggerProvider { get; }

        public async Task<IActionResult> HandleRequestAsync(HttpRequest request, ExecutionContext executionContext, ILogger log, IContextVariableProvider contextVariableProvider = null)
        {
            var requestContext = await request.ToMcmaApiRequestContextAsync(contextVariableProvider ?? new EnvironmentVariableProvider());

            var logger = LoggerProvider?.AddLogger(log, executionContext.InvocationId.ToString(), requestContext.GetTracker());

            logger?.Debug($"Starting {request.Method} request to {request.Path}...");

            await McmaApiController.HandleRequestAsync(requestContext);

            logger?.Debug($"{request.Method} request to {request.Path} finished with status {requestContext.Response.StatusCode}");

            return requestContext.ToActionResult();
        }
    }
}
