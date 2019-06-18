const AWS = require("aws-sdk");
const { AuthenticatorProvider } = require("mcma-core");
const { AwsV4Authenticator } = require("./aws-v4");

const getAwsV4DefaultAuthContext = () => {
    return {
        accessKey: AWS.config.credentials.accessKeyId,
        secretKey: AWS.config.credentials.secretAccessKey,
        sessionToken: AWS.config.credentials.sessionToken,
        region: AWS.config.region
    };
};

const getAwsV4DefaultAuthenticator = () => new AwsV4Authenticator(getAwsV4DefaultAuthContext());

const getAwsV4DefaultAuthProvider = () => {
    const authenticatorAWS4 = getAwsV4DefaultAuthenticator();
    
    return new AuthenticatorProvider(
        async (authType, authContext) => {
            switch (authType) {
                case "AWS4":
                    return authenticatorAWS4;
            }
        }
    );
};

const getAwsV4ResourceManager = (contextVariableProvider) => contextVariableProvider.getResourceManagerFromContext(getAwsV4DefaultAuthProvider());

module.exports = {
    getAwsV4DefaultAuthContext,
    getAwsV4DefaultAuthenticator,
    getAwsV4DefaultAuthProvider,
    getAwsV4ResourceManager
};