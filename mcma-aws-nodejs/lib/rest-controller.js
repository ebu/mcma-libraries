//"use strict";

const uriTemplates = require('uri-templates');

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_ACCEPTED = 202;
const HTTP_NOT_AUTHORITATIVE = 203;
const HTTP_NO_CONTENT = 204;
const HTTP_RESET = 205;
const HTTP_PARTIAL = 206;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_PAYMENT_REQUIRED = 402;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_BAD_METHOD = 405;
const HTTP_NOT_ACCEPTABLE = 406;
const HTTP_PROXY_AUTH = 407;
const HTTP_CLIENT_TIMEOUT = 408;
const HTTP_CONFLICT = 409;
const HTTP_GONE = 410;
const HTTP_LENGTH_REQUIRED = 411;
const HTTP_PRECON_FAILED = 412;
const HTTP_ENTITY_TOO_LARGE = 413;
const HTTP_REQ_TOO_LONG = 414;
const HTTP_UNSUPPORTED_TYPE = 415;
const HTTP_INTERNAL_ERROR = 500;
const HTTP_NOT_IMPLEMENTED = 501;
const HTTP_BAD_GATEWAY = 502;
const HTTP_UNAVAILABLE = 503;
const HTTP_GATEWAY_TIMEOUT = 504;
const HTTP_VERSION = 505;

const getStatusError = (statusCode) => {
    switch (statusCode) {
        case HTTP_OK:
            return "OK";
        case HTTP_CREATED:
            return "Created";
        case HTTP_ACCEPTED:
            return "Accepted";
        case HTTP_NOT_AUTHORITATIVE:
            return "Non-Authoritative Information";
        case HTTP_NO_CONTENT:
            return "No Content";
        case HTTP_RESET:
            return "Reset Content";
        case HTTP_PARTIAL:
            return "Partial Content";
        case HTTP_BAD_REQUEST:
            return "Bad Request";
        case HTTP_UNAUTHORIZED:
            return "Unauthorized";
        case HTTP_PAYMENT_REQUIRED:
            return "Payment Required";
        case HTTP_FORBIDDEN:
            return "Forbidden";
        case HTTP_NOT_FOUND:
            return "Not Found";
        case HTTP_BAD_METHOD:
            return "Method Not Allowed";
        case HTTP_NOT_ACCEPTABLE:
            return "Not Acceptable";
        case HTTP_PROXY_AUTH:
            return "Proxy Authentication Required ";
        case HTTP_CLIENT_TIMEOUT:
            return "Request Timeout";
        case HTTP_CONFLICT:
            return "Conflict";
        case HTTP_GONE:
            return "Gone";
        case HTTP_LENGTH_REQUIRED:
            return "Length Required";
        case HTTP_PRECON_FAILED:
            return "Precondition Failed";
        case HTTP_ENTITY_TOO_LARGE:
            return "Payload Too Large";
        case HTTP_REQ_TOO_LONG:
            return "URI Too Long";
        case HTTP_UNSUPPORTED_TYPE:
            return "Unsupported Media Type";
        case HTTP_INTERNAL_ERROR:
            return "Internal Server Error";
        case HTTP_NOT_IMPLEMENTED:
            return "Not Implemented";
        case HTTP_BAD_GATEWAY:
            return "Bad Gateway";
        case HTTP_UNAVAILABLE:
            return "Service Unavailable";
        case HTTP_GATEWAY_TIMEOUT:
            return "Gateway Timeout";
        case HTTP_VERSION:
            return "HTTP Version Not Supported";
    }

    return "";
}

class ApiError {
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
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    }
}

class RestController {
    constructor() {
        let routes = [];

        this.addRoute = (httpMethod, path, handler) => {
            routes.push({
                httpMethod: httpMethod,
                path: path,
                template: uriTemplates(path),
                handler: handler
            });
        }

        this.handleRequest = async (event, context) => {
            let request = {
                path: event.path,
                httpMethod: event.httpMethod,
                headers: event.headers,
                pathVariables: {},
                queryStringParameters: event.queryStringParameters || {},
                stageVariables: event.stageVariables || {},
                body: event.body
            }

            let response = {
                statusCode: HTTP_OK,
                statusMessage: null,
                headers: getDefaultResponseHeaders(),
                body: null
            }

            let pathMatched = false;
            let methodMatched = false;

            try {
                let requestBodyOK = true;

                if (request.body) {
                    try {
                        request.body = JSON.parse(request.body);
                    } catch (error) {
                        response.statusCode = HTTP_BAD_REQUEST;
                        response.body = new ApiError(response.statusCode, error.message, event.path);
                        requestBodyOK = false;
                    }
                }

                if (requestBodyOK) {
                    for (const route of routes) {
                        if (route.template.test(request.path, { strict: true })) {
                            pathMatched = true;
                            if (route.httpMethod === event.httpMethod) {
                                methodMatched = true;

                                request.pathVariables = route.template.fromUri(request.path, { strict: true });

                                await route.handler(request, response);
                                break;
                            }
                        }
                    }

                    if (!pathMatched) {
                        response.statusCode = HTTP_NOT_FOUND;
                        response.headers = getDefaultResponseHeaders();
                        response.body = new ApiError(response.statusCode, "Resource not found on path '" + event.path + "'.", event.path);
                    } else if (!methodMatched) {
                        response.statusCode = HTTP_BAD_METHOD;
                        response.headers = getDefaultResponseHeaders();
                        response.body = new ApiError(response.statusCode, "Method '" + event.httpMethod + "' not allowed on path '" + event.path + "'.", event.path);
                    } else if ((response.statusCode / 200 << 0) * 200 === 400) {
                        response.headers = getDefaultResponseHeaders();
                        response.body = new ApiError(response.statusCode, response.statusMessage, event.path);
                    }
                }
            } catch (error) {
                console.error(error);

                response.statusCode = HTTP_INTERNAL_ERROR;
                response.headers = getDefaultResponseHeaders();
                response.body = new ApiError(response.statusCode, error.message, event.path);
            }

            let serializedBody = null;
            if (response.body) {
                serializedBody = JSON.stringify(response.body);
            }

            return {
                statusCode: response.statusCode,
                headers: response.headers,
                body: serializedBody
            }
        }
    }
}

module.exports = {
    RestController: RestController,
    HTTP_OK: HTTP_OK,
    HTTP_CREATED: HTTP_CREATED,
    HTTP_ACCEPTED: HTTP_ACCEPTED,
    HTTP_NOT_AUTHORITATIVE: HTTP_NOT_AUTHORITATIVE,
    HTTP_NO_CONTENT: HTTP_NO_CONTENT,
    HTTP_RESET: HTTP_RESET,
    HTTP_PARTIAL: HTTP_PARTIAL,
    HTTP_BAD_REQUEST: HTTP_BAD_REQUEST,
    HTTP_UNAUTHORIZED: HTTP_UNAUTHORIZED,
    HTTP_PAYMENT_REQUIRED: HTTP_PAYMENT_REQUIRED,
    HTTP_FORBIDDEN: HTTP_FORBIDDEN,
    HTTP_NOT_FOUND: HTTP_NOT_FOUND,
    HTTP_BAD_METHOD: HTTP_BAD_METHOD,
    HTTP_NOT_ACCEPTABLE: HTTP_NOT_ACCEPTABLE,
    HTTP_PROXY_AUTH: HTTP_PROXY_AUTH,
    HTTP_CLIENT_TIMEOUT: HTTP_CLIENT_TIMEOUT,
    HTTP_CONFLICT: HTTP_CONFLICT,
    HTTP_GONE: HTTP_GONE,
    HTTP_LENGTH_REQUIRED: HTTP_LENGTH_REQUIRED,
    HTTP_PRECON_FAILED: HTTP_PRECON_FAILED,
    HTTP_ENTITY_TOO_LARGE: HTTP_ENTITY_TOO_LARGE,
    HTTP_REQ_TOO_LONG: HTTP_REQ_TOO_LONG,
    HTTP_UNSUPPORTED_TYPE: HTTP_UNSUPPORTED_TYPE,
    HTTP_INTERNAL_ERROR: HTTP_INTERNAL_ERROR,
    HTTP_NOT_IMPLEMENTED: HTTP_NOT_IMPLEMENTED,
    HTTP_BAD_GATEWAY: HTTP_BAD_GATEWAY,
    HTTP_UNAVAILABLE: HTTP_UNAVAILABLE,
    HTTP_GATEWAY_TIMEOUT: HTTP_GATEWAY_TIMEOUT,
    HTTP_VERSION: HTTP_VERSION
}
