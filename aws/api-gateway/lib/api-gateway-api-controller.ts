import { McmaApiController, McmaApiRequestContext, McmaApiRequest, McmaApiRouteCollection } from "@mcma/api";
import { APIGatewayEvent, Context } from "aws-lambda";
import { LoggerProvider } from "@mcma/core";

export class ApiGatewayApiController {
    private mcmaApiController: McmaApiController;

    constructor(routes: McmaApiRouteCollection, private loggerProvider?: LoggerProvider) {
        this.mcmaApiController = new McmaApiController(routes);
    }

    async handleRequest(event: APIGatewayEvent, context: Context) {
        const requestContext = new McmaApiRequestContext(
            new McmaApiRequest({
                id: context.awsRequestId,
                path: event.path,
                httpMethod: event.httpMethod,
                headers: event.headers,
                pathVariables: {},
                queryStringParameters: event.queryStringParameters,
                body: event.body
            }),
            event.stageVariables,
            this.loggerProvider
        );

        await this.mcmaApiController.handleRequest(requestContext);

        return {
            statusCode: requestContext.response.statusCode,
            headers: requestContext.response.headers,
            body: requestContext.response.body
        };
    }
}
