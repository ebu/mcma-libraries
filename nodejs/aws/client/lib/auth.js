const { AuthenticatorProvider } = require("@mcma/core");
const { AwsV4Authenticator } = require("./aws-v4");

const getAwsV4DefaultAuthContext = (awsConfig) => {
    return {
        accessKey: awsConfig.credentials.accessKeyId,
        secretKey: awsConfig.credentials.secretAccessKey,
        sessionToken: awsConfig.credentials.sessionToken,
        region: awsConfig.region
    };
};

const getAwsV4DefaultAuthenticator = (awsConfig) => new AwsV4Authenticator(getAwsV4DefaultAuthContext(awsConfig));

const getAwsV4DefaultAuthProvider = (awsConfig) => {
    const authenticatorAWS4 = getAwsV4DefaultAuthenticator(awsConfig);
    
    return new AuthenticatorProvider(
        async (authType, authContext) => {
            switch (authType) {
                case "AWS4":
                    return authenticatorAWS4;
            }
        }
    );
};

const getAwsV4ResourceManagerProvider = (awsConfig) => {
    return contextVariableProvider => contextVariableProvider.getResourceManagerFromContext(getAwsV4DefaultAuthProvider(awsConfig));
};

module.exports = {
    getAwsV4DefaultAuthContext,
    getAwsV4DefaultAuthenticator,
    getAwsV4DefaultAuthProvider,
    getAwsV4ResourceManagerProvider
};