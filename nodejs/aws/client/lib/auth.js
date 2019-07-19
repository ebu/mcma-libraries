const { AuthProvider } = require("@mcma/client");
const { AwsV4Authenticator } = require("./aws-v4");

const conformToAwsV4AuthContext = (awsConfig) => {
    if (awsConfig) {
        // check if this is the global AWS object
        if (awsConfig.config) {
            awsConfig = awsConfig.config;
        }
        // check if this is an AWS config object
        if (awsConfig.credentials) {
            awsConfig = {
                accessKey: awsConfig.credentials.accessKeyId,
                secretKey: awsConfig.credentials.secretAccessKey,
                sessionToken: awsConfig.credentials.sessionToken,
                region: awsConfig.region
            };
        }
        // check that it's valid
        if (!awsConfig.accessKey && !awsConfig.accessKeyId) {
            throw new Error("Invalid AWS config object.");
        }
        return awsConfig;
    }
};

AuthProvider.prototype.addAwsV4Auth = function addAwsV4Auth(awsConfig) {
    return this.add("AWS4", authContext => {
        authContext = authContext || conformToAwsV4AuthContext(awsConfig);
        if (!authContext) {
            throw new Error("Auth context for AWSV4 was not provided, and a global AWS config is not available as a default.");
        }
        if (!authContext.accessKey && !authContext.accessKeyId) {
            throw new Error("Invalid AWSV4 auth context.");
        }
        return new AwsV4Authenticator(authContext);
    });
};