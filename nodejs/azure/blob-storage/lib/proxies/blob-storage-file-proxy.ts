import { BlobServiceClient, BlockBlobClient, generateBlobSASQueryParameters, BlobSASPermissions } from "@azure/storage-blob";

import { BlobStorageFileLocator } from "../blob-storage-file-locator";
import { BlobStorageProxy } from "./blob-storage-proxy";

export class BlobStorageFileProxy extends BlobStorageProxy<BlobStorageFileLocator> {
    public blob: BlockBlobClient;

    constructor(locator: BlobStorageFileLocator, client: BlobServiceClient) {
        super(locator, client);
        this.blob = this.container.getBlockBlobClient(locator.filePath);
    }

    async get(buffer?: Buffer): Promise<Buffer> {
        if (buffer) {
            return this.blob.downloadToBuffer(buffer);
        }
        else {
            return this.blob.downloadToBuffer();
        }
    }

    async getAsText(): Promise<string> {
        const buffer = await this.get();
        return buffer.toString("utf-8");
    }

    getPublicReadOnlyUrl(validFor?: number): string {
        const sasQueryParams = generateBlobSASQueryParameters({
            containerName: this.locator.container,
            permissions: BlobSASPermissions.parse("r"),
            expiresOn: new Date(Date.now() + (validFor || 15 * 60 * 1000))
        }, this.credential);
        return this.blob.url + sasQueryParams.toString();
    }
}
