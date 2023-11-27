import { Locator } from "@mcma/core";
import { BlobStorageLocator } from "./blob-storage-locator";

export function buildBlobStorageUrl(account: string, container: string, blobName: string): string {
    return `https://${account}.blob.core.windows.net/${container}/${blobName}`;
}

export function isBlobStorageLocator(x: Locator): x is BlobStorageLocator {
    return typeof x === "object" && x["@type"] === "BlobStorageLocator";
}
