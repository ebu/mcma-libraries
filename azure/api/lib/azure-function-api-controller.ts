import { URL } from "url";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ConfigVariables, LoggerProvider, McmaException } from "@mcma/core";
import { McmaApiController, McmaApiRequest, McmaApiRequestContext, McmaApiRouteCollection, McmaApiMiddleware } from "@mcma/api";
import { HttpRequest } from "@azure/functions";

function getPath(req: HttpRequest): string {
    const hostJson = JSON.parse(fs.readFileSync("host.json", "utf-8"));
    let routePrefix = (hostJson?.extensions?.http?.routePrefix) ?? "api";
    if (routePrefix.length) {
        if (routePrefix[0] !== "/") {
            routePrefix = "/" + routePrefix;
        }
        if (routePrefix[routePrefix.length - 1] === "/") {
            routePrefix = routePrefix.subtr(0, routePrefix.length - 1);
        }
    }

    const requestUrl = new URL(req.url);
    if (!requestUrl.pathname.startsWith(routePrefix)) {
        throw new McmaException(`Received request for url ${req.url} with unexpected path ${requestUrl.pathname}. Expected path to be prefixed with ${routePrefix}`);
    }

    return requestUrl.pathname.substring(routePrefix.length);
}

export interface AzureFunctionApiControllerConfig {
    routes: McmaApiRouteCollection;
    loggerProvider?: LoggerProvider;
    configVariables?: ConfigVariables;
    middleware?: McmaApiMiddleware[];
}

export class AzureFunctionApiController {
    private apiController: McmaApiController;
    private config: AzureFunctionApiControllerConfig;

    constructor(config: AzureFunctionApiControllerConfig);
    constructor(routes: McmaApiRouteCollection, loggerProvider?: LoggerProvider, configVariables?: ConfigVariables);
    constructor(routesOrConfig: McmaApiRouteCollection | AzureFunctionApiControllerConfig, private loggerProvider?: LoggerProvider, private configVariables?: ConfigVariables) {
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

    async handleRequest(req: HttpRequest) {
        const requestContext = new McmaApiRequestContext(
            new McmaApiRequest({
                id: uuidv4(),
                path: getPath(req),
                httpMethod: req.method,
                headers: req.headers,
                pathVariables: {},
                queryStringParameters: req.query,
                body: req.body
            }),
            this.config.loggerProvider,
            this.config.configVariables
        );

        await this.apiController.handleRequest(requestContext);

        return {
            statusCode: requestContext.response.statusCode,
            headers: requestContext.response.headers,
            body: requestContext.response.body
        };
    }
}
