import { McmaApiController, McmaApiRouteCollection, McmaApiRequestContext, McmaApiRequest } from "@mcma/api";
import { v4 as uuid } from "uuid";
import { Request, Response } from "express";
import { IncomingHttpHeaders } from "http";
import { Query } from "express-serve-static-core";
import { EnvironmentVariables, LoggerProvider } from "@mcma/core";

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

export class HttpFunctionApiController {
    private mcmaApiController: McmaApiController;

    constructor(routes: McmaApiRouteCollection, private loggerProvider?: LoggerProvider, private environmentVariables: EnvironmentVariables = EnvironmentVariables.getInstance()) {
        this.mcmaApiController = new McmaApiController(routes);
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
                body: request.body
            }),
            this.loggerProvider,
            this.environmentVariables
        );

        await this.mcmaApiController.handleRequest(requestContext);

        response.statusCode = requestContext.response.statusCode;
        response.statusMessage = requestContext.response.statusMessage;
        
        for (const header in requestContext.response.headers) {
            response.setHeader(header, requestContext.response.headers[header]);
        }

        response.send(requestContext.response.body);
    }
}
