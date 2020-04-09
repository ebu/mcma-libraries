import { Locator } from "@mcma/core";

export interface AwsS3LocatorProperties {
    awsS3Bucket: string;
    url?: string;
}

export abstract class AwsS3Locator extends Locator implements AwsS3LocatorProperties {
    public awsS3Bucket: string;
    public url?: string;
    
    public abstract readonly path: string;
    
    constructor(type: string, properties: AwsS3LocatorProperties) {
        super(type, properties);

        this.checkProperty("awsS3Bucket", "string", true);
    }
}