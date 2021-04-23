import { AwsConfig, isAwsConfigInstance } from "./aws-config";
import { Aws, isAwsInstance } from "./aws";
import { McmaException } from "@mcma/core";

function isAwsAuthContext1Instance(x: any): x is AwsAuthContext1 {
    return !!x && typeof x.accessKeyId !== "undefined";
}

function isAwsAuthContext2Instance(x: any): x is AwsAuthContext2 {
    return !!x && typeof x.accessKey !== "undefined";
}

interface AwsBaseAuthContext {
    region: string;
    sessionToken?: string;
    serviceName?: string;
}

interface AwsAuthContext1 extends AwsBaseAuthContext {
    accessKeyId: string
    secretAccessKey: string
}

interface AwsAuthContext2 extends AwsBaseAuthContext {
    accessKey: string;
    secretKey: string;
}

export type AwsAuthContext = AwsAuthContext1 | AwsAuthContext2;

export function conformToAwsV4AuthContext(awsConfig?: Aws | AwsConfig | AwsAuthContext, throwIfInvalid = true): AwsAuthContext {
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
    }

    // check that it's valid
    if (throwIfInvalid && !isAwsAuthContext1Instance(authContext) && !isAwsAuthContext2Instance(authContext)) {
        throw new McmaException("Invalid AWS config object.");
    }
    return authContext;
}

export function getAwsV4AuthContextForService(awsConfig: Aws | AwsConfig, serviceName: string): AwsAuthContext {
    return Object.assign({}, conformToAwsV4AuthContext(awsConfig), { serviceName });
}
