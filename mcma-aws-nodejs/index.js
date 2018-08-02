//"use strict";

const ApiGatewayRestController = require("./lib/api-gateway-rest-controller");
const DynamoDbTable = require("./lib/dynamo-db-table");

module.exports = {
    HTTP_OK: ApiGatewayRestController.HTTP_OK,
    HTTP_CREATED: ApiGatewayRestController.HTTP_CREATED,
    HTTP_ACCEPTED: ApiGatewayRestController.HTTP_ACCEPTED,
    HTTP_NOT_AUTHORITATIVE: ApiGatewayRestController.HTTP_NOT_AUTHORITATIVE,
    HTTP_NO_CONTENT: ApiGatewayRestController.HTTP_NO_CONTENT,
    HTTP_RESET: ApiGatewayRestController.HTTP_RESET,
    HTTP_PARTIAL: ApiGatewayRestController.HTTP_PARTIAL,
    HTTP_BAD_REQUEST: ApiGatewayRestController.HTTP_BAD_REQUEST,
    HTTP_UNAUTHORIZED: ApiGatewayRestController.HTTP_UNAUTHORIZED,
    HTTP_PAYMENT_REQUIRED: ApiGatewayRestController.HTTP_PAYMENT_REQUIRED,
    HTTP_FORBIDDEN: ApiGatewayRestController.HTTP_FORBIDDEN,
    HTTP_NOT_FOUND: ApiGatewayRestController.HTTP_NOT_FOUND,
    HTTP_BAD_METHOD: ApiGatewayRestController.HTTP_BAD_METHOD,
    HTTP_NOT_ACCEPTABLE: ApiGatewayRestController.HTTP_NOT_ACCEPTABLE,
    HTTP_PROXY_AUTH: ApiGatewayRestController.HTTP_PROXY_AUTH,
    HTTP_CLIENT_TIMEOUT: ApiGatewayRestController.HTTP_CLIENT_TIMEOUT,
    HTTP_CONFLICT: ApiGatewayRestController.HTTP_CONFLICT,
    HTTP_GONE: ApiGatewayRestController.HTTP_GONE,
    HTTP_LENGTH_REQUIRED: ApiGatewayRestController.HTTP_LENGTH_REQUIRED,
    HTTP_PRECON_FAILED: ApiGatewayRestController.HTTP_PRECON_FAILED,
    HTTP_ENTITY_TOO_LARGE: ApiGatewayRestController.HTTP_ENTITY_TOO_LARGE,
    HTTP_REQ_TOO_LONG: ApiGatewayRestController.HTTP_REQ_TOO_LONG,
    HTTP_UNSUPPORTED_TYPE: ApiGatewayRestController.HTTP_UNSUPPORTED_TYPE,
    HTTP_INTERNAL_ERROR: ApiGatewayRestController.HTTP_INTERNAL_ERROR,
    HTTP_NOT_IMPLEMENTED: ApiGatewayRestController.HTTP_NOT_IMPLEMENTED,
    HTTP_BAD_GATEWAY: ApiGatewayRestController.HTTP_BAD_GATEWAY,
    HTTP_UNAVAILABLE: ApiGatewayRestController.HTTP_UNAVAILABLE,
    HTTP_GATEWAY_TIMEOUT: ApiGatewayRestController.HTTP_GATEWAY_TIMEOUT,
    HTTP_VERSION: ApiGatewayRestController.HTTP_VERSION,
    RestController: ApiGatewayRestController.ApiGatewayRestController,
    DynamoDbTable: DynamoDbTable.DynamoDbTable
}
