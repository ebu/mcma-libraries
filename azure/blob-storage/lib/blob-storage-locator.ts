import { Locator, LocatorProperties } from "@mcma/core";

export interface BlobStorageLocatorProperties extends LocatorProperties {
    storageAccountName: string;
    container: string;
}

export abstract class BlobStorageLocator extends Locator implements BlobStorageLocatorProperties {
    storageAccountName: string;
    container: string;

    protected constructor(type: string, properties: BlobStorageLocatorProperties) {
        super(type, properties);
        this.checkProperty("storageAccountName", "string");
        this.checkProperty("container", "string");
    }

    abstract get url(): string;
}
