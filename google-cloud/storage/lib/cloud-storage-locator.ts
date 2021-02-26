import { Locator, LocatorProperties, McmaException } from "@mcma/core";

export interface CloudStorageLocatorProperties extends LocatorProperties {
    bucket?: string;
    filename?: string;
}

export class CloudStorageLocator extends Locator implements CloudStorageLocatorProperties {
    bucket: string;
    filename: string;

    constructor(properties: CloudStorageLocatorProperties) {
        super("CloudStorageLocator", properties);

        const url = new URL(this.url);

        if (url.hostname !== "storage.cloud.google.com") {
            throw new McmaException("Invalid Blob Storage url. Unexpected domain name");
        }

        const pos = url.pathname.indexOf("/", 1);
        if (pos < 0) {
            throw new McmaException("Invalid Blob Storage url. Unexpected domain name");
        }
        if (pos >= 0) {
            this.bucket = url.pathname.substring(1, pos);
            this.filename = url.pathname.substring(pos + 1);
        }
    }
}
