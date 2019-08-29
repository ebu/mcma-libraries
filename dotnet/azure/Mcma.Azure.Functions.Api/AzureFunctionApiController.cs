using System.Threading.Tasks;
using Mcma.Api;
using Mcma.Api.Routes;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Mcma.Azure.Functions.Api
{
    public class AzureFunctionApiController
    {
        public AzureFunctionApiController(McmaApiRouteCollection routeCollection)
        {
            McmaApiController = new McmaApiController(routeCollection);
        }

        private McmaApiController McmaApiController { get; }

        public async Task<IActionResult> HandleRequestAsync(HttpRequest request)
        {
            var requestContext = await request.ToMcmaApiRequestContextAsync();

            await McmaApiController.HandleRequestAsync(requestContext);

            return requestContext.ToActionResult();
        }
    }
}
