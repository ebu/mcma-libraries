import { CloudStorageLocator, CloudStorageLocatorProperties } from "./cloud-storage-locator";

export interface CloudStorageFileLocatorProperties extends CloudStorageLocatorProperties {
    filePath: string;
}

export class CloudStorageFileLocator extends CloudStorageLocator implements CloudStorageFileLocatorProperties {
    public filePath: string;

    constructor(properties: CloudStorageFileLocatorProperties) {
        super("CloudStorageFileLocator", properties);

        this.checkProperty("filePath", "string", true);
    }
}