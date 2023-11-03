import { ConfigVariables, LoggerProvider } from "@mcma/core";
import { McmaApiController, McmaApiRequest, McmaApiRequestContext, McmaApiRouteCollection, McmaApiMiddleware } from "@mcma/api";
import { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResult, APIGatewayProxyResultV2, Context } from "aws-lambda";

function isAPIGatewayProxyEvent(x: any): x is APIGatewayProxyEvent {
    return !!x.httpMethod;
}

export interface ApiGatewayApiControllerConfig {
    routes: McmaApiRouteCollection;
    loggerProvider?: LoggerProvider;
    configVariables?: ConfigVariables;
    middleware?: McmaApiMiddleware[];
    includeStageInPath?: boolean;
}

export class ApiGatewayApiController {
    private apiController: McmaApiController;
    private config: ApiGatewayApiControllerConfig;

    constructor(config: ApiGatewayApiControllerConfig);
    constructor(routes: McmaApiRouteCollection, loggerProvider?: LoggerProvider, configVariables?: ConfigVariables);
    constructor(routesOrConfig: McmaApiRouteCollection | ApiGatewayApiControllerConfig, loggerProvider?: LoggerProvider, configVariables?: ConfigVariables) {
        if (routesOrConfig instanceof McmaApiRouteCollection) {
            this.config = {
                routes: routesOrConfig,
                loggerProvider: loggerProvider,
                configVariables: configVariables,
            }
        } else {
            this.config = routesOrConfig
        }

        if (!this.config.configVariables) {
            this.config.configVariables = ConfigVariables.getInstance();
        }

        this.apiController = new McmaApiController(this.config.routes, this.config.middleware);
    }

    async handleRequest(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2>
    async handleRequest(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>
    async handleRequest(event: APIGatewayProxyEvent | APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResult | APIGatewayProxyResultV2> {
        let httpMethod, path;
        if (isAPIGatewayProxyEvent(event)) {
            httpMethod = event.httpMethod;
            path = this.config.includeStageInPath ? event.requestContext.path : event.path;
        } else {
            httpMethod = event.requestContext.http.method;
            path = this.config.includeStageInPath || event.requestContext.stage === "$default" ? event.requestContext.http.path : event.requestContext.http.path.substring(event.requestContext.stage.length + 1);
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
            this.config.loggerProvider,
            this.config.configVariables
        );

        await this.apiController.handleRequest(requestContext);

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
