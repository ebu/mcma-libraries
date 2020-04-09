import { Readable } from "stream";
import { BlobServiceClient, ContainerClient, BlockBlobClient } from "@azure/storage-blob";
import { BlobStorageLocator } from "../blob-storage-locator";
import { BlobStorageFileLocator } from "../blob-storage-file-locator";
import { BlobStorageFolderLocator } from "../blob-storage-folder-locator";

export interface BlobStorageProxy<T extends BlobStorageLocator> {
    container: ContainerClient;
    locator: T;
    client: BlobServiceClient;
}

export interface BlobStorageFileProxy extends BlobStorageProxy<BlobStorageFileLocator> {
    blob: BlockBlobClient;

    get(buffer?: Buffer): Promise<Buffer>;
    getAsText(): Promise<string>;
    getPublicReadOnlyUrl(validFor?: number): string;
}

export interface BlobStorageFolderProxy extends BlobStorageProxy<BlobStorageFolderLocator> {
    put(fileName: string, readFrom: Readable): Promise<BlobStorageFileLocator>;
    putAsText(fileName: string, content: string): Promise<BlobStorageFileLocator>;
}
