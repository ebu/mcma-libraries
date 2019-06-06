//"use strict";
const { AwsV4Authenticator, AwsV4PresignedUrlGenerator } = require('./lib/aws-v4');
const { DynamoDbTable, dynamoDbTableProvider } = require('./lib/dynamo-db-table');
const { ApiGatewayApiController, awsDefaultRoutes } = require('./lib/api-gateway-api-controller');
const { getAwsV4DefaultAuthContext, getAwsV4DefaultAuthProvider, getAwsV4DefaultAuthenticator, getAwsV4ResourceManager } = require('./lib/auth');
const { awsResourceManagerProvider } = require('./lib/resource-manager-provider');
require('./lib/worker-builder-ext');

module.exports = {
    AwsV4Authenticator,
    AwsV4PresignedUrlGenerator,
    DynamoDbTable,
    dynamoDbTableProvider,
    ApiGatewayApiController,
    awsDefaultRoutes,
    getAwsV4DefaultAuthContext,
    getAwsV4DefaultAuthProvider,
    getAwsV4DefaultAuthenticator,
    getAwsV4ResourceManager,
    awsResourceManagerProvider
};