using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using Mcma.Api;
using Mcma.Api.Routes;
using Mcma.Core;
using Mcma.Core.Logging;
using Mcma.Aws.Lambda;
using Mcma.Api.Routes.Defaults;

namespace Mcma.Aws.ApiGateway
{
    public class ApiGatewayApiController
    {
        static ApiGatewayApiController()
        {
            Logger.Global = new LambdaLoggerWrapper();
        }

        public ApiGatewayApiController(McmaApiRouteCollection routes)
        {
            McmaApiController = new McmaApiController(routes);
        }

        private McmaApiController McmaApiController { get; }

        public async Task<APIGatewayProxyResponse> HandleRequestAsync(APIGatewayProxyRequest @event, ILambdaContext context)
        {
            var requestContext = new McmaApiRequestContext(
                new McmaApiRequest
                {
                    Path = @event.Path,
                    HttpMethod = new HttpMethod(@event.HttpMethod),
                    Headers = @event.Headers,
                    PathVariables = new Dictionary<string, object>(),
                    QueryStringParameters = @event.QueryStringParameters ?? new Dictionary<string, string>(),
                    Body = @event.Body
                },
                @event.StageVariables
            );
            
            await McmaApiController.HandleRequestAsync(requestContext);

            return new APIGatewayProxyResponse
            {
                StatusCode = requestContext.Response.StatusCode,
                Headers = requestContext.Response.Headers,
                Body = requestContext.Response.Body
            };
        }
    }
}