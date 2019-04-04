//"use strict";

const RestControllers = require("./lib/rest-controllers");
const DynamoDbTable = require("./lib/dynamo-db-table");

module.exports = {
    HTTP_OK: RestControllers.HTTP_OK,
    HTTP_CREATED: RestControllers.HTTP_CREATED,
    HTTP_ACCEPTED: RestControllers.HTTP_ACCEPTED,
    HTTP_NOT_AUTHORITATIVE: RestControllers.HTTP_NOT_AUTHORITATIVE,
    HTTP_NO_CONTENT: RestControllers.HTTP_NO_CONTENT,
    HTTP_RESET: RestControllers.HTTP_RESET,
    HTTP_PARTIAL: RestControllers.HTTP_PARTIAL,
    HTTP_BAD_REQUEST: RestControllers.HTTP_BAD_REQUEST,
    HTTP_UNAUTHORIZED: RestControllers.HTTP_UNAUTHORIZED,
    HTTP_PAYMENT_REQUIRED: RestControllers.HTTP_PAYMENT_REQUIRED,
    HTTP_FORBIDDEN: RestControllers.HTTP_FORBIDDEN,
    HTTP_NOT_FOUND: RestControllers.HTTP_NOT_FOUND,
    HTTP_BAD_METHOD: RestControllers.HTTP_BAD_METHOD,
    HTTP_NOT_ACCEPTABLE: RestControllers.HTTP_NOT_ACCEPTABLE,
    HTTP_PROXY_AUTH: RestControllers.HTTP_PROXY_AUTH,
    HTTP_CLIENT_TIMEOUT: RestControllers.HTTP_CLIENT_TIMEOUT,
    HTTP_CONFLICT: RestControllers.HTTP_CONFLICT,
    HTTP_GONE: RestControllers.HTTP_GONE,
    HTTP_LENGTH_REQUIRED: RestControllers.HTTP_LENGTH_REQUIRED,
    HTTP_PRECON_FAILED: RestControllers.HTTP_PRECON_FAILED,
    HTTP_ENTITY_TOO_LARGE: RestControllers.HTTP_ENTITY_TOO_LARGE,
    HTTP_REQ_TOO_LONG: RestControllers.HTTP_REQ_TOO_LONG,
    HTTP_UNSUPPORTED_TYPE: RestControllers.HTTP_UNSUPPORTED_TYPE,
    HTTP_INTERNAL_ERROR: RestControllers.HTTP_INTERNAL_ERROR,
    HTTP_NOT_IMPLEMENTED: RestControllers.HTTP_NOT_IMPLEMENTED,
    HTTP_BAD_GATEWAY: RestControllers.HTTP_BAD_GATEWAY,
    HTTP_UNAVAILABLE: RestControllers.HTTP_UNAVAILABLE,
    HTTP_GATEWAY_TIMEOUT: RestControllers.HTTP_GATEWAY_TIMEOUT,
    HTTP_VERSION: RestControllers.HTTP_VERSION,
    ApiGatewayRestController: RestControllers.ApiGatewayRestController,
    DynamoDbTable: DynamoDbTable.DynamoDbTable
}
