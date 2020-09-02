interface AwsBaseAuthContext {
    region: string;
    sessionToken?: string;
    serviceName?: string;
}

export interface AwsAuthContext1 extends AwsBaseAuthContext {
    accessKeyId: string
    secretAccessKey: string
}

export interface AwsAuthContext2 extends AwsBaseAuthContext {
    accessKey: string;
    secretKey: string;
}

export type AwsAuthContext = AwsAuthContext1 | AwsAuthContext2;

export const isAwsAuthContext1Instance = (x: any): x is AwsAuthContext1 => typeof x.accessKeyId !== "undefined";
export const isAwsAuthContext2Instance = (x: any): x is AwsAuthContext2 => typeof x.accessKey !== "undefined";
