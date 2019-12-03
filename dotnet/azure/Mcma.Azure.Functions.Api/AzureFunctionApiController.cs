using System.Threading.Tasks;
using Mcma.Api;
using Mcma.Api.Routes;
using Mcma.Azure.Functions.Logging;
using Mcma.Core.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Mcma.Azure.Functions.Api
{
    public class AzureFunctionApiController
    {
        public AzureFunctionApiController(McmaApiRouteCollection routeCollection, MicrosoftLoggerProvider loggerProvider = null)
        {
            McmaApiController = new McmaApiController(routeCollection);
            LoggerProvider = loggerProvider;
        }

        private McmaApiController McmaApiController { get; }

        private MicrosoftLoggerProvider LoggerProvider { get; }

        public async Task<IActionResult> HandleRequestAsync(HttpRequest request, ILogger log, IContextVariableProvider contextVariableProvider = null)
        {
            var requestContext = await request.ToMcmaApiRequestContextAsync(contextVariableProvider ?? new EnvironmentVariableProvider());

            LoggerProvider?.AddLogger(log, requestContext.GetTracker());

            await McmaApiController.HandleRequestAsync(requestContext);

            return requestContext.ToActionResult();
        }
    }
}
