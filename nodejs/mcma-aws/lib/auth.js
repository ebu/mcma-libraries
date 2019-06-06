const { AuthenticatorProvider } = require('mcma-core');
const { AwsV4Authenticator } = require('./aws-v4');

const getAwsV4DefaultAuthContext = (AWS) => {
    return {
        accessKey: AWS.config.credentials.accessKeyId,
        secretKey: AWS.config.credentials.secretAccessKey,
        sessionToken: AWS.config.credentials.sessionToken,
        region: AWS.config.region
    };
};

const getAwsV4DefaultAuthenticator = (AWS) => new AwsV4Authenticator(getAwsV4DefaultAuthContext(AWS));

const getAwsV4DefaultAuthProvider = (AWS) => {
    const authenticatorAWS4 = getAwsV4DefaultAuthenticator(AWS);
    
    return new AuthenticatorProvider(
        async (authType, authContext) => {
            switch (authType) {
                case "AWS4":
                    return authenticatorAWS4;
            }
        }
    );
};

const getAwsV4ResourceManager = (contextVariableProvider, AWS) => contextVariableProvider.getResourceManagerFromContext(getAwsV4DefaultAuthProvider(AWS));

module.exports = {
    getAwsV4DefaultAuthContext,
    getAwsV4DefaultAuthenticator,
    getAwsV4DefaultAuthProvider,
    getAwsV4ResourceManager
};