import { Locator, LocatorProperties } from "@mcma/core";

export interface CloudStorageLocatorProperties extends LocatorProperties {
    bucket: string;
}

export abstract class CloudStorageLocator extends Locator implements CloudStorageLocatorProperties {
    bucket: string;

    protected constructor(type: string, properties: CloudStorageLocatorProperties) {
        super(type, properties);

        this.checkProperty("bucket", "string", true);
    }
}
