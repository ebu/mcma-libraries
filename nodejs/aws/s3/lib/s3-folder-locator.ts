import { AwsS3Locator, AwsS3LocatorProperties } from "./s3-locator";

export interface AwsS3FolderLocatorProperties extends AwsS3LocatorProperties {
    awsS3KeyPrefix?: string;
}

export class AwsS3FolderLocator extends AwsS3Locator implements AwsS3FolderLocatorProperties {
    public awsS3KeyPrefix?: string;
    
    constructor(properties: AwsS3FolderLocatorProperties) {
        super("AwsS3FolderLocator", properties);
        
        this.checkProperty("awsS3KeyPrefix", "string", false);
    }

    get path(): string {
        return this.awsS3KeyPrefix;
    }
}
