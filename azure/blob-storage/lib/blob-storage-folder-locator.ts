import { BlobStorageLocatorProperties, BlobStorageLocator } from "./blob-storage-locator";

export interface BlobStorageFolderLocatorProperties extends BlobStorageLocatorProperties {
    folderPath: string;
}

export class BlobStorageFolderLocator extends BlobStorageLocator implements BlobStorageFolderLocatorProperties {
    folderPath: string;
    
    constructor(properties: BlobStorageFolderLocatorProperties) {
        super("BlobStorageFolderLocator", properties);
        this.checkProperty("folderPath", "string");
    }

    get url(): string {
        return `https://${this.storageAccountName}.blob.core.windows.net/${this.container}/${this.folderPath}`;
    }
}
