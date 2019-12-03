using Mcma.Api.Routes;
using Mcma.Azure.Functions.Logging;

namespace Mcma.Azure.Functions.Api
{
    public static class RouteCollectionExtensions
    {
        public static AzureFunctionApiController ToAzureFunctionApiController(this McmaApiRouteCollection routeCollection, MicrosoftLoggerProvider loggerProvider = null)
            => new AzureFunctionApiController(routeCollection, loggerProvider);
    }
}
