import { BlobStorageLocator, BlobStorageLocatorProperties } from "./blob-storage-locator";

export interface BlobStorageFileLocatorProperties extends BlobStorageLocatorProperties {
    filePath: string;
}

export class BlobStorageFileLocator extends BlobStorageLocator implements BlobStorageFileLocatorProperties {
    filePath: string;

    constructor(properties: BlobStorageFileLocatorProperties) {
        super("BlobStorageFileLocator", properties);
        this.checkProperty("filePath", "string");
    }

    get url(): string {
        return `https://${this.storageAccountName}.blob.core.windows.net/${this.container}/${this.filePath}`;
    }
}
