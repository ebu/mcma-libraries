import { AwsS3Locator, AwsS3LocatorProperties } from "./s3-locator";

export interface AwsS3FolderLocatorProperties extends AwsS3LocatorProperties {
    keyPrefix?: string;
}

export class AwsS3FolderLocator extends AwsS3Locator implements AwsS3FolderLocatorProperties {
    public keyPrefix?: string;
    
    constructor(properties: AwsS3FolderLocatorProperties) {
        super("AwsS3FolderLocator", properties);
        
        this.checkProperty("keyPrefix", "string", false);
    }

    get path(): string {
        return this.keyPrefix;
    }
}
