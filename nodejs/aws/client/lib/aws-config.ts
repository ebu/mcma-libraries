export interface AwsCredentials {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
}

export interface AwsConfig {
    credentials?: AwsCredentials;
    region?: string;
}

export const isAwsConfigInstance = (x: any): x is AwsConfig => typeof x.credentials !== "undefined";