import { AwsS3Locator, AwsS3LocatorProperties } from "./s3-locator";

export interface AwsS3FileLocatorProperties extends AwsS3LocatorProperties {
    awsS3Key: string;
}

export class AwsS3FileLocator extends AwsS3Locator implements AwsS3FileLocatorProperties {
    public awsS3Key: string;

    constructor(properties: AwsS3FileLocatorProperties) {
        super("AwsS3FileLocator", properties);
        
        this.checkProperty("awsS3Key", "string", true);
    }

    get path(): string {
        return this.awsS3Key;
    }
}
