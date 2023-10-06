import { HttpStatusCode } from "./http-statuses";
import { McmaApiRouteCollection } from "../routing";
import { McmaApiRequestContext } from "./mcma-api-request-context";
import { McmaApiError } from "./mcma-api-error";
import { McmaApiMiddleware } from "./mcma-api-middleware";
import { Utils } from "@mcma/core";

function getDefaultResponseHeaders() {
    return {
        "Date": new Date().toUTCString(),
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    };
}

export class McmaApiController {
    private readonly pipeline: (requestContext: McmaApiRequestContext) => Promise<void>;

    constructor(private readonly routes?: McmaApiRouteCollection, middleware?: McmaApiMiddleware[]) {
        this.routes = this.routes || new McmaApiRouteCollection();

        this.pipeline = this.processRoute.bind(this);
        if (Array.isArray(middleware)) {
            for (let i = middleware.length - 1; i >= 0; i--) {
                const mw = middleware[i];
                const pipeline = this.pipeline;
                this.pipeline = async (requestContext: McmaApiRequestContext) => {
                    await mw.execute(requestContext, pipeline);
                };
            }
        }
    }

    async handleRequest(requestContext: McmaApiRequestContext): Promise<void> {
        const request = requestContext.request;
        const response = requestContext.response;

        response.headers = getDefaultResponseHeaders();

        try {
            await this.pipeline(requestContext);
        } catch (error) {
            const logger = await requestContext.getLogger();
            logger?.error(error);

            response.statusCode = HttpStatusCode.InternalServerError;
            response.headers = getDefaultResponseHeaders();
            response.body = new McmaApiError({
                status: response.statusCode,
                message: error.message,
                path: request.path
            });
        }
    }

    private async processRoute(requestContext: McmaApiRequestContext): Promise<void> {
        const request = requestContext.request;
        const response = requestContext.response;

        let pathMatched = false;
        let methodMatched = false;
        let requestBodyOK = true;

        if (request.body && typeof request.body === "string" && request.headers[Object.keys(request.headers).find(h => h.toLowerCase() === "content-type")]?.toLowerCase().startsWith("application/json")) {
            try {
                request.body = JSON.parse(request.body, Utils.reviver);
            } catch (error) {
                response.statusCode = HttpStatusCode.BadRequest;
                response.body = new McmaApiError({
                    status: response.statusCode,
                    message: error.message,
                    path: request.path
                });
                requestBodyOK = false;
            }
        }

        if (requestBodyOK) {
            let methodsAllowed = "";

            for (const route of this.routes) {
                if (route.template.test(request.path, { strict: true })) {
                    pathMatched = true;

                    if (methodsAllowed) {
                        methodsAllowed += ", ";
                    }
                    methodsAllowed += route.httpMethod;

                    if (route.httpMethod === request.httpMethod) {
                        methodMatched = true;

                        request.pathVariables = route.template.fromUri(request.path, { strict: true });

                        await route.handler(requestContext);
                        break;
                    }
                }
            }

            if (!pathMatched) {
                response.statusCode = HttpStatusCode.NotFound;
                response.headers = getDefaultResponseHeaders();
                response.body = new McmaApiError({
                    status: response.statusCode,
                    message: "Resource not found on path '" + request.path + "'.",
                    path: request.path
                });
            } else if (!methodMatched) {
                if (!methodsAllowed.includes("OPTIONS")) {
                    if (methodsAllowed) {
                        methodsAllowed += ", ";
                    }
                    methodsAllowed += "OPTIONS";
                }

                if (request.httpMethod === "OPTIONS") {
                    response.statusCode = HttpStatusCode.OK;
                    response.headers = getDefaultResponseHeaders();

                    let corsMethod;
                    let corsHeaders;

                    // checking if its a CORS pre-flight request
                    for (const prop in request.headers) {
                        if (request.headers.hasOwnProperty(prop)) {
                            if (prop.toLowerCase() === "access-control-request-method") {
                                corsMethod = request.headers[prop];
                            }
                            if (prop.toLowerCase() === "access-control-request-headers") {
                                corsHeaders = request.headers[prop];
                            }
                        }
                    }

                    if (corsMethod) { // handling CORS pre-flight request
                        response.headers["Access-Control-Allow-Methods"] = methodsAllowed;

                        if (corsHeaders) {
                            response.headers["Access-Control-Allow-Headers"] = corsHeaders;
                        }
                    } else { // handling regular OPTIONS request
                        response.headers["Allow"] = methodsAllowed;
                    }
                } else {
                    response.statusCode = HttpStatusCode.MethodNotAllowed;
                    response.headers = getDefaultResponseHeaders();
                    response.headers["Allow"] = methodsAllowed;
                    response.body = new McmaApiError({
                        status: response.statusCode,
                        message: "Method '" + request.httpMethod + "' not allowed on path '" + request.path + "'.",
                        path: request.path
                    });
                }
            } else if ((response.statusCode / 200 << 0) * 200 === 400) {
                if (!response.body) {
                    response.body = new McmaApiError({
                        status: response.statusCode,
                        message: response.errorMessage,
                        path: request.path
                    });
                }
            } else if (response.statusCode === 0) {
                response.statusCode = HttpStatusCode.OK;
            }
        }
    }
}
