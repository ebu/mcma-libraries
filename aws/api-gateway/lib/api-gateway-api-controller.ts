import { EnvironmentVariables, LoggerProvider } from "@mcma/core";
import { McmaApiController, McmaApiRequest, McmaApiRequestContext, McmaApiRouteCollection } from "@mcma/api";
import { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "aws-lambda";
import { APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy";

function isAPIGatewayProxyEvent(x: any): x is APIGatewayProxyEvent {
    return !!x.httpMethod;
}

export class ApiGatewayApiController {
    private mcmaApiController: McmaApiController;

    constructor(routes: McmaApiRouteCollection, private loggerProvider?: LoggerProvider, private environmentVariables: EnvironmentVariables = EnvironmentVariables.getInstance()) {
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
            this.loggerProvider,
            this.environmentVariables
        );

        await this.mcmaApiController.handleRequest(requestContext);

        const isBase64Encoded = Buffer.isBuffer(requestContext.response.body);
        const body = isBase64Encoded ? (<Buffer>requestContext.response.body).toString("base64") : requestContext.response.body;

        return {
            statusCode: requestContext.response.statusCode,
            headers: requestContext.response.headers,
            body,
            isBase64Encoded
        };
    }
}
