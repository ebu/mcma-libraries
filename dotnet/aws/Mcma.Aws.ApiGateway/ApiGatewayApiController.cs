using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using Mcma.Api;
using Mcma.Api.Routes;
using Mcma.Logging;

namespace Mcma.Aws.ApiGateway
{
    public class ApiGatewayApiController
    {
        public ApiGatewayApiController(McmaApiRouteCollection routes, ILoggerProvider loggerProvider = null)
        {
            McmaApiController = new McmaApiController(routes);
            LoggerProvider = loggerProvider;
        }

        private McmaApiController McmaApiController { get; }

        private ILoggerProvider LoggerProvider { get; }

        public async Task<APIGatewayProxyResponse> HandleRequestAsync(APIGatewayProxyRequest @event, ILambdaContext context)
        {
            var requestContext = new McmaApiRequestContext(
                new McmaApiRequest
                {
                    Id = context.AwsRequestId,
                    Path = @event.Path,
                    HttpMethod = new HttpMethod(@event.HttpMethod),
                    Headers = @event.Headers,
                    PathVariables = new Dictionary<string, object>(),
                    QueryStringParameters = @event.QueryStringParameters ?? new Dictionary<string, string>(),
                    Body = @event.Body
                },
                @event.StageVariables,
                LoggerProvider
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