import { McmaApiController, McmaApiRouteCollection, McmaApiRequestContext, McmaApiRequest, McmaApiMiddleware } from "@mcma/api";
import { v4 as uuid } from "uuid";
import { Request, Response } from "express";
import { IncomingHttpHeaders } from "http";
import { Query } from "express-serve-static-core";
import { ConfigVariables, LoggerProvider } from "@mcma/core";

function asStringMap(obj: Query | IncomingHttpHeaders): { [key: string]: string } {
    const copy: { [key: string]: string } = {};
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (Array.isArray(val)) {
            copy[key] = val.join(",");
        } else if (typeof val === "object") {
            copy[key] = JSON.stringify(val);
        } else {
            copy[key] = val;
        }
    }
    return copy;
}

export interface HttpFunctionApiControllerConfig {
    routes: McmaApiRouteCollection;
    loggerProvider?: LoggerProvider;
    configVariables?: ConfigVariables;
    middleware?: McmaApiMiddleware[];
}

export class HttpFunctionApiController {
    private apiController: McmaApiController;
    private config: HttpFunctionApiControllerConfig;

    constructor(config: HttpFunctionApiControllerConfig);
    constructor(routes: McmaApiRouteCollection, loggerProvider?: LoggerProvider, configVariables?: ConfigVariables);
    constructor(routesOrConfig: McmaApiRouteCollection | HttpFunctionApiControllerConfig, private loggerProvider?: LoggerProvider, private configVariables?: ConfigVariables) {
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

    async handleRequest(request: Request, response: Response): Promise<void> {
        const requestContext = new McmaApiRequestContext(
            new McmaApiRequest({
                id: uuid(),
                path: request.path,
                httpMethod: request.method,
                headers: asStringMap(request.headers),
                pathVariables: {},
                queryStringParameters: asStringMap(request.query),
                body: request.body,
                originalRequest: request,
            }),
            this.config.loggerProvider,
            this.config.configVariables
        );

        await this.apiController.handleRequest(requestContext);

        response.statusCode = requestContext.response.statusCode;
        response.statusMessage = requestContext.response.errorMessage;
        
        for (const header in requestContext.response.headers) {
            response.setHeader(header, requestContext.response.headers[header]);
        }

        response.send(requestContext.response.body);
    }
}
