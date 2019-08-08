using Mcma.Api.Routes;

namespace Mcma.Aws.ApiGateway
{
    public static class DefaultRouteCollectionBuilderExtensions
    {
        public static ApiGatewayApiController ToApiGatewayApiController(this McmaApiRouteCollection routes)
            => new ApiGatewayApiController(routes);
    }
}