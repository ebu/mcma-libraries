import { GoogleCloudStorageLocator, GoogleCloudStorageLocatorProperties } from "./cloud-storage-locator";

export interface GoogleCloudStorageFileLocatorProperties extends GoogleCloudStorageLocatorProperties {
    filePath: string;
}

export class GoogleCloudStorageFileLocator extends GoogleCloudStorageLocator implements GoogleCloudStorageFileLocatorProperties {
    public filePath: string;

    constructor(properties: GoogleCloudStorageFileLocatorProperties) {
        super("GoogleCloudStorageFileLocator", properties);

        this.checkProperty("filePath", "string", true);
    }
}