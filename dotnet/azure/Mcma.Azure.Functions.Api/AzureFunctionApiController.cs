using System.Threading.Tasks;
using Mcma.Api;
using Mcma.Api.Routes;
using Mcma.Core.ContextVariables;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;

namespace Mcma.Azure.Functions.Api
{
    public class AzureFunctionApiController
    {
        public AzureFunctionApiController(McmaApiRouteCollection routeCollection)
        {
            McmaApiController = new McmaApiController(routeCollection);
        }

        private McmaApiController McmaApiController { get; }

        public async Task<IActionResult> HandleRequestAsync(HttpRequest request, IContextVariableProvider contextVariableProvider = null)
        {
            var requestContext = await request.ToMcmaApiRequestContextAsync(contextVariableProvider ?? new EnvironmentVariableProvider());

            await McmaApiController.HandleRequestAsync(requestContext);

            return requestContext.ToActionResult();
        }
    }
}
