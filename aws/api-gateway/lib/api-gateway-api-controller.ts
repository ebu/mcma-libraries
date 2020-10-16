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
    async handleRequest(event: APIGatewayProxyEvent | APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResult | APIGatewayProxyResultV2> {
        let httpMethod, path;
        if (isAPIGatewayProxyEvent(event)) {
            httpMethod = event.httpMethod;
            path = event.path;
        } else {
            httpMethod = event.requestContext.http.method;
            path = event.requestContext.http.path.substring(event.requestContext.stage.length + 1);
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

        let body = requestContext.response.body;
        let isBase64Encoded = false;
        if (Buffer.isBuffer(body)) {
            isBase64Encoded = true;
            body = (<Buffer>body).toString("base64");
        } else if (typeof body === "object") {
            body = JSON.stringify(body);
        }

        return {
            statusCode: requestContext.response.statusCode,
            headers: requestContext.response.headers,
            body,
            isBase64Encoded
        };
    }
}
