//"use strict";
const { HttpStatusCode, getStatusError } = require("./http-statuses");

class McmaApiError {
    constructor(statusCode, message, path) {
        this["@type"] = "ApiError";
        this.timestamp = new Date().toISOString();
        this.status = statusCode;
        this.error = getStatusError(statusCode);
        this.message = message;
        this.path = path;
    }
}

const getDefaultResponseHeaders = () => {
    return {
        "Date": new Date().toUTCString(),
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    }
}

class McmaApiController {
    constructor(routes) {
        this.routes = routes || [];
    }

    async handleRequest(requestContext) {
        const request = requestContext.request;
        const response = requestContext.response;

        response.headers = getDefaultResponseHeaders();

        let pathMatched = false;
        let methodMatched = false;

        try {
            let requestBodyOK = true;

            if (request.body) {
                try {
                    request.body = JSON.parse(request.body);
                } catch (error) {
                    response.statusCode = HttpStatusCode.BAD_REQUEST;
                    response.body = new McmaApiError(response.statusCode, error.message, request.path);
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
                    response.statusCode = HttpStatusCode.NOT_FOUND;
                    response.headers = getDefaultResponseHeaders();
                    response.body = new McmaApiError(response.statusCode, "Resource not found on path '" + request.path + "'.", request.path);
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
                            if (prop.toLowerCase() === "access-control-request-method") {
                                corsMethod = request.headers[prop];
                            }
                            if (prop.toLowerCase() === "access-control-request-headers") {
                                corsHeaders = request.headers[prop];
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
                        response.statusCode = HttpStatusCode.METHOD_NOT_ALLOWED;
                        response.headers = getDefaultResponseHeaders();
                        response.headers["Allow"] = methodsAllowed;
                        response.body = new McmaApiError(response.statusCode, "Method '" + request.httpMethod + "' not allowed on path '" + request.path + "'.", request.path);
                    }
                } else if ((response.statusCode / 200 << 0) * 200 === 400) {
                    response.headers = getDefaultResponseHeaders();
                    response.body = new McmaApiError(response.statusCode, response.statusMessage, request.path);
                } else {
                    response.statusCode = HttpStatusCode.OK;
                }
            }
        } catch (error) {
            console.error(error);

            response.statusCode = HttpStatusCode.INTERNAL_ERROR;
            response.headers = getDefaultResponseHeaders();
            response.body = new McmaApiError(response.statusCode, error.message, request.path);
        }

        if (response.body) {
            response.body = JSON.stringify(response.body);
        }
    }
}

module.exports = {
    McmaApiController
};
