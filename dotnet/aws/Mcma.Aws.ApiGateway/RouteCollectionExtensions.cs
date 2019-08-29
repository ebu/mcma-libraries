using Mcma.Api.Routes;

namespace Mcma.Aws.ApiGateway
{
    public static class RouteCollectionExtensions
    {
        public static ApiGatewayApiController ToApiGatewayApiController(this McmaApiRouteCollection routes)
            => new ApiGatewayApiController(routes);
    }
}