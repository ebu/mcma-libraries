//"use strict";

const RestController = require("./lib/rest-controller");
const DynamoDbTable = require("./lib/dynamo-db-table");

module.exports = {
    HTTP_OK: RestController.HTTP_OK,
    HTTP_CREATED: RestController.HTTP_CREATED,
    HTTP_ACCEPTED: RestController.HTTP_ACCEPTED,
    HTTP_NOT_AUTHORITATIVE: RestController.HTTP_NOT_AUTHORITATIVE,
    HTTP_NO_CONTENT: RestController.HTTP_NO_CONTENT,
    HTTP_RESET: RestController.HTTP_RESET,
    HTTP_PARTIAL: RestController.HTTP_PARTIAL,
    HTTP_BAD_REQUEST: RestController.HTTP_BAD_REQUEST,
    HTTP_UNAUTHORIZED: RestController.HTTP_UNAUTHORIZED,
    HTTP_PAYMENT_REQUIRED: RestController.HTTP_PAYMENT_REQUIRED,
    HTTP_FORBIDDEN: RestController.HTTP_FORBIDDEN,
    HTTP_NOT_FOUND: RestController.HTTP_NOT_FOUND,
    HTTP_BAD_METHOD: RestController.HTTP_BAD_METHOD,
    HTTP_NOT_ACCEPTABLE: RestController.HTTP_NOT_ACCEPTABLE,
    HTTP_PROXY_AUTH: RestController.HTTP_PROXY_AUTH,
    HTTP_CLIENT_TIMEOUT: RestController.HTTP_CLIENT_TIMEOUT,
    HTTP_CONFLICT: RestController.HTTP_CONFLICT,
    HTTP_GONE: RestController.HTTP_GONE,
    HTTP_LENGTH_REQUIRED: RestController.HTTP_LENGTH_REQUIRED,
    HTTP_PRECON_FAILED: RestController.HTTP_PRECON_FAILED,
    HTTP_ENTITY_TOO_LARGE: RestController.HTTP_ENTITY_TOO_LARGE,
    HTTP_REQ_TOO_LONG: RestController.HTTP_REQ_TOO_LONG,
    HTTP_UNSUPPORTED_TYPE: RestController.HTTP_UNSUPPORTED_TYPE,
    HTTP_INTERNAL_ERROR: RestController.HTTP_INTERNAL_ERROR,
    HTTP_NOT_IMPLEMENTED: RestController.HTTP_NOT_IMPLEMENTED,
    HTTP_BAD_GATEWAY: RestController.HTTP_BAD_GATEWAY,
    HTTP_UNAVAILABLE: RestController.HTTP_UNAVAILABLE,
    HTTP_GATEWAY_TIMEOUT: RestController.HTTP_GATEWAY_TIMEOUT,
    HTTP_VERSION: RestController.HTTP_VERSION,
    RestController: RestController.RestController,
    DynamoDbTable: DynamoDbTable.DynamoDbTable
}
