import { McmaApiController, McmaApiRequestContext, McmaApiRequest, McmaApiRouteCollection } from "@mcma/api";
import {
    APIGatewayProxyEvent,
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
    Context
} from "aws-lambda";
import { LoggerProvider } from "@mcma/core";
import { APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy";

function isAPIGatewayProxyEvent(x: any): x is APIGatewayProxyEvent {
    return !!x.httpMethod;
}

export class ApiGatewayApiController {
    private mcmaApiController: McmaApiController;

    constructor(routes: McmaApiRouteCollection, private loggerProvider?: LoggerProvider) {
        this.mcmaApiController = new McmaApiController(routes);
    }

    async handleRequest(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2>
    async handleRequest(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>
    async handleRequest(event: APIGatewayProxyEvent | APIGatewayProxyEventV2, context: Context) {
        let httpMethod, path;
        if (isAPIGatewayProxyEvent(event)) {
            httpMethod = event.httpMethod;
            path = event.path;
        } else {
            httpMethod = event.requestContext.http.method;
            path = event.requestContext.http.path;
        }
        const requestContext = new McmaApiRequestContext(
            new McmaApiRequest({
                id: context.awsRequestId,
                path,
                httpMethod,
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
