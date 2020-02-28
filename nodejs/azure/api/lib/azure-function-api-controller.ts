import { URL } from "url";
import * as fs from "fs";
import { McmaApiController, McmaApiRouteCollection, McmaApiRequestContext, McmaApiRequest } from "@mcma/api";
import { HttpRequest } from "@azure/functions";
import { Exception } from "@mcma/core";

export class AzureFunctionApiController {
    private apiController: McmaApiController;

    constructor(routes: McmaApiRouteCollection) {
        this.apiController = new McmaApiController(routes);
    }

    async handleRequest(req: HttpRequest) {
        const requestContext = new McmaApiRequestContext(
            new McmaApiRequest({
                path: this.getPath(req),
                httpMethod: req.method,
                headers: req.headers,
                pathVariables: {},
                queryStringParameters: req.query,
                body: req.body
            }),
            process.env //context.bindingData
        );

        await this.apiController.handleRequest(requestContext);

        return {
            statusCode: requestContext.response.statusCode,
            headers: requestContext.response.headers,
            body: requestContext.response.body
        };
    }

    private getPath(req: HttpRequest): string {
        const hostJson = JSON.parse(fs.readFileSync("host.json", "utf-8"));
        let routePrefix = (hostJson && hostJson.extensions && hostJson.extensions.http && hostJson.extensions.http.routePrefix) || "api";
        if (routePrefix[0] !== "/") {
            routePrefix = "/" + routePrefix;
        }

        const requestUrl = new URL(req.url);
        if (!requestUrl.pathname.startsWith(routePrefix)) {
            throw new Exception(`Received request for url ${req.url} with unexpected path ${requestUrl.pathname}. Expected path to be prefixed with ${routePrefix}`);
        }

        return requestUrl.pathname.substr(routePrefix.length);
    }
}