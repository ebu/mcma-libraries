import { Locator, LocatorProperties } from "@mcma/core";

export interface AwsS3FolderLocatorProperties extends LocatorProperties {
    awsS3Bucket: string;
    awsS3KeyPrefix?: string;
}

export class AwsS3FolderLocator extends Locator<AwsS3FolderLocatorProperties> implements AwsS3FolderLocatorProperties {
    public awsS3Bucket: string;
    public awsS3KeyPrefix?: string;
    
    constructor(properties: AwsS3FolderLocatorProperties) {
        super("AwsS3FolderLocator", properties);
        this.checkProperty("awsS3Bucket", "string", true);
        this.checkProperty("awsS3KeyPrefix", "string", false);
    }
}
