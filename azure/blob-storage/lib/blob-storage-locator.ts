import { Locator, LocatorProperties, McmaException } from "@mcma/core";

export interface BlobStorageLocatorProperties extends LocatorProperties {
    account?: string;
    container?: string;
    blobName?: string
}

export class BlobStorageLocator extends Locator implements BlobStorageLocatorProperties {
    account: string;
    container: string;
    blobName: string;

    constructor(properties: BlobStorageLocatorProperties) {
        super("BlobStorageLocator", properties);

        const url = new URL(this.url);

        // checking domain name
        const parts = url.hostname.split(".");
        if (parts.length !== 5 ||
            parts[1] !== "blob" ||
            parts[2] !== "core" ||
            parts[3] !== "windows" ||
            parts[4] !== "net") {
            throw new McmaException("Invalid Blob Storage url. Unexpected domain name");
        }

        this.account = parts[0];

        const pos = url.pathname.indexOf("/", 1);
        if (pos >= 0) {
            this.container = url.pathname.substring(1, pos);
            this.blobName = url.pathname.substring(pos + 1);
        } else {
            this.container = "$root";
            this.blobName = url.pathname.substring(1);
        }
    }
}
