import { Locator } from "@mcma/core"

export interface AwsS3FileLocatorProperties {
    awsS3Bucket: string;
    awsS3Key: string;
}

export class AwsS3FileLocator extends Locator implements AwsS3FileLocatorProperties {
    constructor(properties: AwsS3FileLocatorProperties);
    awsS3Bucket: string;
    awsS3Key: string;
}

export interface AwsS3FolderLocatorProperties {
    awsS3Bucket: string;
    awsS3KeyPrefix?: string;
}

export class AwsS3FolderLocator extends Locator implements AwsS3FolderLocatorProperties {
    constructor(properties: AwsS3FolderLocatorProperties);
    awsS3Bucket: string;
    awsS3KeyPrefix?: string;
}
