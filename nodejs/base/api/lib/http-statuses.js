const HttpStatusCode = Object.freeze({
    CONTINUE: 100,
    SWITCHING_PROTOCOLS: 101,
    PROCESSING: 102,
    CHECKPOINT: 103,
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NON_AUTHORITATIVE_INFORMATION: 203,
    NO_CONTENT: 204,
    RESET_CONTENT: 205,
    PARTIAL_CONTENT: 206,
    MULTI_STATUS: 207,
    ALREADY_REPORTED: 208,
    IM_USED: 226,
    MULTIPLE_CHOICES: 300,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    SEE_OTHER: 303,
    NOT_MODIFIED: 304,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    REQUESTED_RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    I_AM_A_TEAPOT: 418,
    UNPROCESSABLE_ENTITY: 422,
    LOCKED: 423,
    FAILED_DEPENDENCY: 424,
    TOO_EARLY: 425,
    UPGRADE_REQUIRED: 426,
    PRECONDITION_REQUIRED: 428,
    TOO_MANY_REQUESTS: 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
    UNAVAILABLE_FOR_LEGAL_REASONS: 451,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
    VARIANT_ALSO_NEGOTIATES: 506,
    INSUFFICIENT_STORAGE: 507,
    LOOP_DETECTED: 508,
    BANDWIDTH_LIMIT_EXCEEDED: 509,
    NOT_EXTENDED: 510,
    NETWORK_AUTHENTICATION_REQUIRED: 511,
});

const getStatusError = (statusCode) => {
    switch (statusCode) {
        case HttpStatusCode.CONTINUE:
            return "Continue";
        case HttpStatusCode.SWITCHING_PROTOCOLS:
            return "Switching Protocols";
        case HttpStatusCode.PROCESSING:
            return "Processing";
        case HttpStatusCode.CHECKPOINT:
            return "Checkpoint";
        case HttpStatusCode.OK:
            return "OK";
        case HttpStatusCode.CREATED:
            return "Created";
        case HttpStatusCode.ACCEPTED:
            return "Accepted";
        case HttpStatusCode.NON_AUTHORITATIVE_INFORMATION:
            return "Non-Authoritative Information";
        case HttpStatusCode.NO_CONTENT:
            return "No Content";
        case HttpStatusCode.RESET_CONTENT:
            return "Reset Content";
        case HttpStatusCode.PARTIAL_CONTENT:
            return "Partial Content";
        case HttpStatusCode.MULTI_STATUS:
            return "Multi-Status";
        case HttpStatusCode.ALREADY_REPORTED:
            return "Already Reported";
        case HttpStatusCode.IM_USED:
            return "IM Used";
        case HttpStatusCode.MULTIPLE_CHOICES:
            return "Multiple Choices";
        case HttpStatusCode.MOVED_PERMANENTLY:
            return "Moved Permanently";
        case HttpStatusCode.FOUND:
            return "Found";
        case HttpStatusCode.SEE_OTHER:
            return "See Other";
        case HttpStatusCode.NOT_MODIFIED:
            return "Not Modified";
        case HttpStatusCode.TEMPORARY_REDIRECT:
            return "Temporary Redirect";
        case HttpStatusCode.PERMANENT_REDIRECT:
            return "Permanent Redirect";
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
        case HttpStatusCode.PROXY_AUTHENTICATION_REQUIRED:
            return "Proxy Authentication Required ";
        case HttpStatusCode.REQUEST_TIMEOUT:
            return "Request Timeout";
        case HttpStatusCode.CONFLICT:
            return "Conflict";
        case HttpStatusCode.GONE:
            return "Gone";
        case HttpStatusCode.LENGTH_REQUIRED:
            return "Length Required";
        case HttpStatusCode.PRECONDITION_FAILED:
            return "Precondition Failed";
        case HttpStatusCode.PAYLOAD_TOO_LARGE:
            return "Payload Too Large";
        case HttpStatusCode.URI_TOO_LONG:
            return "URI Too Long";
        case HttpStatusCode.UNSUPPORTED_MEDIA_TYPE:
            return "Unsupported Media Type";
        case HttpStatusCode.REQUESTED_RANGE_NOT_SATISFIABLE:
            return "Requested Range Not Satisfiable";
        case HttpStatusCode.EXPECTATION_FAILED:
            return "Expectation Failed";
        case HttpStatusCode.I_AM_A_TEAPOT:
            return "I'm a teapot";
        case HttpStatusCode.UNPROCESSABLE_ENTITY:
            return "Unprocessable Entity";
        case HttpStatusCode.LOCKED:
            return "Locked";
        case HttpStatusCode.FAILED_DEPENDENCY:
            return "Failed Dependency";
        case HttpStatusCode.TOO_EARLY:
            return "Too Early";
        case HttpStatusCode.UPGRADE_REQUIRED:
            return "Upgrade Required";
        case HttpStatusCode.PRECONDITION_REQUIRED:
            return "Precondition Required";
        case HttpStatusCode.TOO_MANY_REQUESTS:
            return "Too Many Requests";
        case HttpStatusCode.REQUEST_HEADER_FIELDS_TOO_LARGE:
            return "Request Header Fields Too Large";
        case HttpStatusCode.UNAVAILABLE_FOR_LEGAL_REASONS:
            return "Unavailable For Legal Reasons";
        case HttpStatusCode.INTERNAL_SERVER_ERROR:
            return "Internal Server Error";
        case HttpStatusCode.NOT_IMPLEMENTED:
            return "Not Implemented";
        case HttpStatusCode.BAD_GATEWAY:
            return "Bad Gateway";
        case HttpStatusCode.SERVICE_UNAVAILABLE:
            return "Service Unavailable";
        case HttpStatusCode.GATEWAY_TIMEOUT:
            return "Gateway Timeout";
        case HttpStatusCode.HTTP_VERSION_NOT_SUPPORTED:
            return "HTTP Version Not Supported";
        case HttpStatusCode.VARIANT_ALSO_NEGOTIATES:
            return "Variant Also Negotiates";
        case HttpStatusCode.INSUFFICIENT_STORAGE:
            return "Insufficient Storage";
        case HttpStatusCode.LOOP_DETECTED:
            return "Loop Detected";
        case HttpStatusCode.BANDWIDTH_LIMIT_EXCEEDED:
            return "Bandwidth Limit Exceeded";
        case HttpStatusCode.NOT_EXTENDED:
            return "Not Extended";
        case HttpStatusCode.NETWORK_AUTHENTICATION_REQUIRED:
            return "Network Authentication Required";

    }

    return "";
};

module.exports = {
    HttpStatusCode,
    getStatusError
};
