import { Locator } from "@mcma/core";

export interface GoogleCloudStorageLocatorProperties {
    bucket: string;
}

export abstract class GoogleCloudStorageLocator extends Locator implements GoogleCloudStorageLocatorProperties {
    bucket: string;

    protected constructor(type: string, properties: GoogleCloudStorageLocatorProperties) {
        super(type, properties);

        this.checkProperty("bucket", "string", true);
    }
}