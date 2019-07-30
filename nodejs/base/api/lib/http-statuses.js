const HttpStatusCode = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NOT_AUTHORITATIVE: 203,
    NO_CONTENT: 204,
    RESET: 205,
    PARTIAL: 206,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTH: 407,
    CLIENT_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECON_FAILED: 412,
    ENTITY_TOO_LARGE: 413,
    REQ_TOO_LONG: 414,
    UNSUPPORTED_TYPE: 415,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    VERSION: 505,
};

const getStatusError = (statusCode) => {
    switch (statusCode) {
        case HttpStatusCode.OK:
            return "OK";
        case HttpStatusCode.CREATED:
            return "Created";
        case HttpStatusCode.ACCEPTED:
            return "Accepted";
        case HttpStatusCode.NOT_AUTHORITATIVE:
            return "Non-Authoritative Information";
        case HttpStatusCode.NO_CONTENT:
            return "No Content";
        case HttpStatusCode.RESET:
            return "Reset Content";
        case HttpStatusCode.PARTIAL:
            return "Partial Content";
        case HttpStatusCode.BAD_REQUEST:
            return "Bad Request";
        case HttpStatusCode.UNAUTHORIZED:
            return "Unauthorized";
        case HttpStatusCode.PAYMENT_REQUIRED:
            return "Payment Required";
        case HttpStatusCode.FORBIDDEN:
            return "Forbidden";
        case HttpStatusCode.NOT_FOUND:
            return "Not Found";
        case HttpStatusCode.METHOD_NOT_ALLOWED:
            return "Method Not Allowed";
        case HttpStatusCode.NOT_ACCEPTABLE:
            return "Not Acceptable";
        case HttpStatusCode.PROXY_AUTH:
            return "Proxy Authentication Required ";
        case HttpStatusCode.CLIENT_TIMEOUT:
            return "Request Timeout";
        case HttpStatusCode.CONFLICT:
            return "Conflict";
        case HttpStatusCode.GONE:
            return "Gone";
        case HttpStatusCode.LENGTH_REQUIRED:
            return "Length Required";
        case HttpStatusCode.PRECON_FAILED:
            return "Precondition Failed";
        case HttpStatusCode.ENTITY_TOO_LARGE:
            return "Payload Too Large";
        case HttpStatusCode.REQ_TOO_LONG:
            return "URI Too Long";
        case HttpStatusCode.UNSUPPORTED_TYPE:
            return "Unsupported Media Type";
        case HttpStatusCode.UNPROCESSABLE_ENTITY:
            return "Unprocessable Entity";
        case HttpStatusCode.INTERNAL_ERROR:
            return "Internal Server Error";
        case HttpStatusCode.NOT_IMPLEMENTED:
            return "Not Implemented";
        case HttpStatusCode.BAD_GATEWAY:
            return "Bad Gateway";
        case HttpStatusCode.UNAVAILABLE:
            return "Service Unavailable";
        case HttpStatusCode.GATEWAY_TIMEOUT:
            return "Gateway Timeout";
        case HttpStatusCode.VERSION:
            return "HTTP Version Not Supported";
    }

    return "";
}

module.exports = {
    HttpStatusCode,
    getStatusError
};