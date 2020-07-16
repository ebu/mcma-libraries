import { GoogleCloudStorageLocator, GoogleCloudStorageLocatorProperties } from "./cloud-storage-locator";

export interface GoogleCloudStorageFolderLocatorProperties extends GoogleCloudStorageLocatorProperties  {
    folderPath?: string;
}

export class GoogleCloudStorageFolderLocator extends GoogleCloudStorageLocator implements GoogleCloudStorageFolderLocatorProperties {
    public folderPath?: string;
    
    constructor(properties: GoogleCloudStorageFolderLocatorProperties) {
        super("GoogleCloudStorageFolderLocator", properties);

        this.checkProperty("folderPath", "string", false);
    }
}