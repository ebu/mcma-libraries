using System.Threading.Tasks;
using Mcma.Api;
using Mcma.Api.Routes;
using Mcma.Core.Context;
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

        public async Task<IActionResult> HandleRequestAsync(HttpRequest request, IContextVariables contextVariables = null)
        {
            var requestContext = await request.ToMcmaApiRequestContextAsync(contextVariables ?? new EnvironmentVariables());

            await McmaApiController.HandleRequestAsync(requestContext);

            return requestContext.ToActionResult();
        }
    }
}
