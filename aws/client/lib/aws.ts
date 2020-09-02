import { AwsConfig } from "./aws-config";

export interface Aws {
    config: AwsConfig;
}

export const isAwsInstance = (x: any): x is Aws => typeof x.config !== "undefined";
