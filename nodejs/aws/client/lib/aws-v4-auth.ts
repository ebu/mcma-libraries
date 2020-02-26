import { AuthTypeRegistration } from "@mcma/client";
import { AwsV4Authenticator } from "./aws-v4";
import { Aws, isAwsInstance } from "./aws";
import { AwsConfig, isAwsConfigInstance } from "./aws-config";
import { AwsAuthContext, isAwsAuthContext1Instance, isAwsAuthContext2Instance } from "./aws-auth-context";

const conformToAwsV4AuthContext = (awsConfig?: Aws | AwsConfig | AwsAuthContext): AwsAuthContext => {
    let authContext: AwsAuthContext;
    if (awsConfig) {
        // check if this is the global AWS object
        if (isAwsInstance(awsConfig)) {
            awsConfig = awsConfig.config;
        }
        // check if this is an AWS config object
        if (isAwsConfigInstance(awsConfig)) {
            authContext = {
                accessKey: awsConfig.credentials.accessKeyId,
                secretKey: awsConfig.credentials.secretAccessKey,
                sessionToken: awsConfig.credentials.sessionToken,
                region: awsConfig.region
            };
        } else {
            authContext = awsConfig;
        }
        // check that it's valid
        if (!isAwsAuthContext1Instance(authContext) && !isAwsAuthContext2Instance(authContext)) {
            throw new Error("Invalid AWS config object.");
        }
        return authContext;
    }
};

export const awsV4Auth = (awsConfig?: Aws | AwsConfig | AwsAuthContext): AuthTypeRegistration<AwsAuthContext> => ({
    authType: "AWS4",
    authenticatorFactory: authContext => {
        authContext = authContext || conformToAwsV4AuthContext(awsConfig);
        return new AwsV4Authenticator(authContext);
    }
});