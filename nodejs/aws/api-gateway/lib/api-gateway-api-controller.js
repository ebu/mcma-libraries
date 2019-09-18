const { McmaApiController, McmaApiRequestContext, McmaApiRequest, McmaApiRouteCollection } = require("@mcma/api");

class ApiGatewayApiController {
    constructor(routes) {
        const mcmaApiController = new McmaApiController(routes);
        this.handleRequest = async (event, context) => {
            const requestContext = new McmaApiRequestContext(
                new McmaApiRequest({
                    path: event.path,
                    httpMethod: event.httpMethod,
                    headers: event.headers,
                    pathVariables: {},
                    queryStringParameters: event.queryStringParameters,
                    body: event.body
                }),
                event.stageVariables
            );

            await mcmaApiController.handleRequest(requestContext);

            return {
                statusCode: requestContext.response.statusCode,
                headers: requestContext.response.headers,
                body: requestContext.response.body
            };
        };
    }
}

McmaApiRouteCollection.prototype.toApiGatewayApiController = function toApiGatewayApiController() {
    return new ApiGatewayApiController(this);
};

module.exports = {
    ApiGatewayApiController
};
