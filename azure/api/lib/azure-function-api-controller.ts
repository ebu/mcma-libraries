import { URL } from "url";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { ConfigVariables, LoggerProvider, McmaException } from "@mcma/core";
import { McmaApiController, McmaApiRequest, McmaApiRequestContext, McmaApiRouteCollection, McmaApiMiddleware } from "@mcma/api";

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
            };
        } else {
            this.config = routesOrConfig;
        }

        if (!this.config.configVariables) {
            this.config.configVariables = ConfigVariables.getInstance();
        }

        this.apiController = new McmaApiController(this.config.routes, this.config.middleware);
    }

    async handleRequest(req: HttpRequest): Promise<HttpResponseInit> {
        const headers: { [key: string]: string } = {};
        for (const entry of req.headers.entries()) {
            headers[entry[0]] = entry[1];
        }

        const queryStringParameters: { [key: string]: string } = {};
        for (const entry of req.query.entries()) {
            queryStringParameters[entry[0]] = entry[1];
        }

        let httpMethod = req.method?.toUpperCase();
        let requestBody: any = undefined;
        switch (httpMethod) {
            case "POST":
            case "PUT":
            case "PATCH":
                requestBody = await req.text();
                break;
        }

        const requestContext = new McmaApiRequestContext(
            new McmaApiRequest({
                id: uuidv4(),
                path: getPath(req),
                httpMethod,
                headers,
                pathVariables: {},
                queryStringParameters,
                body: requestBody,
            }),
            this.config.loggerProvider,
            this.config.configVariables
        );

        await this.apiController.handleRequest(requestContext);

        let responseBody = requestContext.response.body;
        if (typeof responseBody === "object") {
            responseBody = JSON.stringify(responseBody);
        }

        return {
            status: requestContext.response.statusCode,
            headers: requestContext.response.headers,
            body: responseBody,
        };
    }
}
