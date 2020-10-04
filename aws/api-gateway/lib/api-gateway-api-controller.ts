import { McmaApiController, McmaApiRequest, McmaApiRequestContext, McmaApiRouteCollection } from "@mcma/api";
import { APIGatewayProxyEvent, APIGatewayProxyEventV2, Context } from "aws-lambda";
import { LoggerProvider } from "@mcma/core";

export class ApiGatewayApiController {
    private mcmaApiController: McmaApiController;

    constructor(routes: McmaApiRouteCollection, private loggerProvider?: LoggerProvider) {
        this.mcmaApiController = new McmaApiController(routes);
    }

    async handleRequest(event: APIGatewayProxyEvent | APIGatewayProxyEventV2, context: Context) {
        const requestContext = new McmaApiRequestContext(
            new McmaApiRequest({
                id: context.awsRequestId,
                path: (<APIGatewayProxyEvent>event).path ?? (<APIGatewayProxyEventV2>event).requestContext?.http?.path?.substring((<APIGatewayProxyEventV2>event).requestContext?.http?.path?.indexOf("/", 1)),
                httpMethod: (<APIGatewayProxyEvent>event).httpMethod ?? (<APIGatewayProxyEventV2>event).requestContext?.http?.method,
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
