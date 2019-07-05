//"use strict";
const { AwsV4Authenticator, AwsV4PresignedUrlGenerator } = require("./lib/aws-v4");
const { getAwsV4DefaultAuthContext, getAwsV4DefaultAuthProvider, getAwsV4DefaultAuthenticator, getAwsV4ResourceManager } = require("./lib/auth");

module.exports = {
    AwsV4Authenticator,
    AwsV4PresignedUrlGenerator,
    getAwsV4DefaultAuthContext,
    getAwsV4DefaultAuthProvider,
    getAwsV4DefaultAuthenticator,
    getAwsV4ResourceManager
};