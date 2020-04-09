import { Locator } from "@mcma/core";

export interface BlobStorageLocatorProperties {
    storageAccountName: string;
    container: string;
}

export abstract class BlobStorageLocator extends Locator implements BlobStorageLocatorProperties {
    storageAccountName: string;
    container: string;

    constructor(type: string, properties: BlobStorageLocatorProperties) {
        super(type, properties);
        this.checkProperty("storageAccountName", "string");
        this.checkProperty("container", "string");
    }

    abstract get url(): string;
}
