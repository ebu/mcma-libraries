import {
    BlobSASPermissions,
    BlobServiceClient,
    BlockBlobClient,
    BlockBlobUploadOptions,
    ContainerClient,
    generateBlobSASQueryParameters,
    StorageSharedKeyCredential
} from "@azure/storage-blob";
import { BlobStorageLocator } from "../blob-storage-locator";
import { Readable } from "stream";
import { buildBlobStorageUrl } from "../helpers";

export class BlobStorageProxy {
    public container: ContainerClient;
    private readonly credential: StorageSharedKeyCredential;
    public blob: BlockBlobClient;

    constructor(public locator: BlobStorageLocator, public client: BlobServiceClient) {
        this.container = this.client.getContainerClient(locator.container);
        this.credential = this.client.credential as StorageSharedKeyCredential;
        this.blob = this.container.getBlockBlobClient(locator.blobName);
    }

    async get(buffer?: Buffer): Promise<Buffer> {
        if (buffer) {
            return this.blob.downloadToBuffer(buffer);
        } else {
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
        return this.locator.url + "?" + sasQueryParams.toString();
    }

    async put(filename: string, readFrom: Readable, options?: BlockBlobUploadOptions): Promise<BlobStorageLocator> {
        const blob = this.container.getBlockBlobClient(filename);
        await blob.uploadStream(readFrom, undefined, undefined, options);
        return new BlobStorageLocator({ url: buildBlobStorageUrl(this.locator.account, this.locator.container, filename) });
    }

    async putAsText(filename: string, content: string, options?: BlockBlobUploadOptions): Promise<BlobStorageLocator> {
        const blob = this.container.getBlockBlobClient(filename);
        await blob.upload(content, content.length, options);
        return new BlobStorageLocator({ url: buildBlobStorageUrl(this.locator.account, this.locator.container, filename) });
    }
}
