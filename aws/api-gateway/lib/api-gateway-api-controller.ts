import { ConfigVariables, LoggerProvider } from "@mcma/core";
import { McmaApiController, McmaApiRequest, McmaApiRequestContext, McmaApiRouteCollection } from "@mcma/api";
import { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResult, APIGatewayProxyResultV2, Context } from "aws-lambda";

function isAPIGatewayProxyEvent(x: any): x is APIGatewayProxyEvent {
    return !!x.httpMethod;
}

export class ApiGatewayApiController {
    private mcmaApiController: McmaApiController;

    constructor(routes: McmaApiRouteCollection, private loggerProvider?: LoggerProvider, private configVariables: ConfigVariables = ConfigVariables.getInstance()) {
        this.mcmaApiController = new McmaApiController(routes);
    }

    async handleRequest(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2>
    async handleRequest(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>
    async handleRequest(event: APIGatewayProxyEvent | APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResult | APIGatewayProxyResultV2> {
        const requestContext = new McmaApiRequestContext(
            new McmaApiRequest({
                id: context.awsRequestId,
                path: "/" + (event.pathParameters?.proxy ?? ""),
                httpMethod: isAPIGatewayProxyEvent(event) ? event.httpMethod : event.requestContext.http.method,
                headers: event.headers,
                pathVariables: {},
                queryStringParameters: event.queryStringParameters,
                body: event.body
            }),
            this.loggerProvider,
            this.configVariables
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
