import { Locator } from "@mcma/core";

export interface AwsS3FileLocatorProperties {
    awsS3Bucket: string;
    awsS3Key: string;
}

export class AwsS3FileLocator extends Locator implements AwsS3FileLocatorProperties {
    public awsS3Bucket: string;
    public awsS3Key: string;

    constructor(properties: AwsS3FileLocatorProperties) {
        super("AwsS3FileLocator", properties);
        
        this.checkProperty("awsS3Bucket", "string", true);
        this.checkProperty("awsS3Key", "string", true);
    }
}
