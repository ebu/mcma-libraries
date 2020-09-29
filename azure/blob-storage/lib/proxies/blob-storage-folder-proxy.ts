import { Readable } from "stream";
import { BlobServiceClient, BlockBlobUploadOptions } from "@azure/storage-blob";

import { BlobStorageFolderLocator } from "../blob-storage-folder-locator";
import { BlobStorageFileLocator } from "../blob-storage-file-locator";
import { getFileLocator } from "../helpers";
import { BlobStorageProxy } from "./blob-storage-proxy";

export class BlobStorageFolderProxy extends BlobStorageProxy<BlobStorageFolderLocator> {
    constructor(locator: BlobStorageFolderLocator, client: BlobServiceClient) {
        super(locator, client);
    }

    async put(fileName: string, readFrom: Readable, options?: BlockBlobUploadOptions): Promise<BlobStorageFileLocator> {
        const fileLocator = getFileLocator(this.locator, fileName);
        const blob = this.container.getBlockBlobClient(fileLocator.filePath);
        await blob.uploadStream(readFrom, undefined, undefined, options);
        return fileLocator;
    }

    async putAsText(fileName: string, content: string, options?: BlockBlobUploadOptions): Promise<BlobStorageFileLocator> {
        const fileLocator = getFileLocator(this.locator, fileName);
        const blob = this.container.getBlockBlobClient(fileLocator.filePath);
        await blob.upload(content, content.length, options);
        return fileLocator;
    }
}
