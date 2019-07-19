//import { Lambda } from "aws-sdk";
import { Authenticator, AuthProvider, HttpRequestConfig, ResourceManager, ResourceManagerProvider } from "@mcma/client";

interface AwsConfig {
    credentials: {
        accessKeyId: string,
        secretAccessKey: string,
        sessionToken: string
    },
    region: string
}

interface Aws {
    config: AwsConfig;
}

interface AwsBaseAuthContext {
    region: string;
    sessionToken?: string;
    serviceName?: string;
}

interface AwsAuthContext1 {
    accessKeyId: string
    secretAccessKey: string
}

interface AwsAuthContext2 {
    accessKey: string;
    secretKey: string;
}

type AwsAuthContext = AwsAuthContext1 | AwsAuthContext2;

export class AwsV4Authenticator implements Authenticator {
    constructor(config: AwsAuthContext);

    sign(request: HttpRequestConfig): void;
}

export class AwsV4PresignedUrlGenerator {
    constructor(config: AwsAuthContext);

    generatePresignedUrl(method: string, requestUrl: string, expires?: number): string;
}

declare module "@mcma/client" {
    interface AuthProvider {
        addAwsV4Auth(awsConfig?: Aws | AwsConfig | AwsAuthContext): AuthProvider;
    }
}