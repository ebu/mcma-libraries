const { Utils } = require("mcma-core");
const { McmaApiController, McmaApiRequestContext, McmaApiRequest, McmaApiRouteCollection, defaultRoutes } = require("mcma-api");
const { dynamoDbTableProvider } = require("./dynamo-db-table");

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
        }
    }
}

function awsDefaultRoutes(type) {
    type = Utils.getTypeName(type);
    const dfr = defaultRoutes(type);
    dfr.withDynamoDb = (root) => dfr.builder(() => dynamoDbTableProvider(type), root);
    return dfr;
}

McmaApiRouteCollection.prototype.toApiGatewayApiController = function toApiGatewayApiController() {
    return new ApiGatewayApiController(this);
}

module.exports = {
    ApiGatewayApiController,
    awsDefaultRoutes
};