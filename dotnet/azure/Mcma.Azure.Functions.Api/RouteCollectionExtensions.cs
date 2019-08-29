using Mcma.Api.Routes;

namespace Mcma.Azure.Functions.Api
{
    public static class RouteCollectionExtensions
    {
        public static AzureFunctionApiController ToAzureFunctionApiController(this McmaApiRouteCollection routeCollection)
            => new AzureFunctionApiController(routeCollection);
    }
}
