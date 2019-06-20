//"use strict";
const { AwsV4Authenticator, AwsV4PresignedUrlGenerator } = require("./lib/aws-v4");
const { DynamoDbTable, DynamoDbTableProvider } = require("./lib/dynamo-db-table");
const { ApiGatewayApiController, awsDefaultRoutes } = require("./lib/api-gateway-api-controller");
const { getAwsV4DefaultAuthContext, getAwsV4DefaultAuthProvider, getAwsV4DefaultAuthenticator, getAwsV4ResourceManager } = require("./lib/auth");
const { invokeLambdaWorker } = require("./lib/lambda-worker-invoker");
require("./lib/worker-builder-ext");

module.exports = {
    AwsV4Authenticator,
    AwsV4PresignedUrlGenerator,
    DynamoDbTable,
    DynamoDbTableProvider,
    ApiGatewayApiController,
    awsDefaultRoutes,
    getAwsV4DefaultAuthContext,
    getAwsV4DefaultAuthProvider,
    getAwsV4DefaultAuthenticator,
    getAwsV4ResourceManager,
    invokeLambdaWorker
};