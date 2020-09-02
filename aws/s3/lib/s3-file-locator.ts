import { AwsS3Locator, AwsS3LocatorProperties } from "./s3-locator";

export interface AwsS3FileLocatorProperties extends AwsS3LocatorProperties {
    key: string;
}

export class AwsS3FileLocator extends AwsS3Locator implements AwsS3FileLocatorProperties {
    public key: string;

    constructor(properties: AwsS3FileLocatorProperties) {
        super("AwsS3FileLocator", properties);
        
        this.checkProperty("key", "string", true);
    }

    get path(): string {
        return this.key;
    }
}
