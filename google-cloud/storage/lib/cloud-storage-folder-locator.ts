import { CloudStorageLocator, CloudStorageLocatorProperties } from "./cloud-storage-locator";

export interface CloudStorageFolderLocatorProperties extends CloudStorageLocatorProperties  {
    folderPath?: string;
}

export class CloudStorageFolderLocator extends CloudStorageLocator implements CloudStorageFolderLocatorProperties {
    public folderPath?: string;
    
    constructor(properties: CloudStorageFolderLocatorProperties) {
        super("CloudStorageFolderLocator", properties);

        this.checkProperty("folderPath", "string", false);
    }
}