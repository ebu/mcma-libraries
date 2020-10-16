import { CloudStorageProxy } from "./cloud-storage-proxy";
import { CloudStorageFolderLocatorProperties } from "../cloud-storage-folder-locator";
import { CreateWriteStreamOptions, Storage, StorageOptions } from "@google-cloud/storage";
import { CloudStorageFileLocator } from "../cloud-storage-file-locator";
import { getFileLocator } from "../helpers";

export class CloudStorageFolderProxy extends CloudStorageProxy<CloudStorageFolderLocatorProperties> {

    constructor(locator: CloudStorageFolderLocatorProperties, storageOrOptions?: StorageOptions | Storage) {
        super(locator, storageOrOptions);
    }

    async upload(fileName: string, readFrom: NodeJS.ReadableStream, options?: CreateWriteStreamOptions): Promise<CloudStorageFileLocator> {
        const fileLocator = getFileLocator(this.locator, fileName);
        const uploadStream = this.bucket.file(fileLocator.filePath).createWriteStream(options);
        return new Promise<CloudStorageFileLocator>((res, rej) => {
            readFrom.on("end", () => res(fileLocator));
            readFrom.on("error", err => rej(err));
            readFrom.pipe(uploadStream);
        });
    }

    async uploadAsText(fileName: string, content: string, options?: CreateWriteStreamOptions): Promise<CloudStorageFileLocator> {
        const fileLocator = getFileLocator(this.locator, fileName);
        const uploadStream = this.bucket.file(fileLocator.filePath).createWriteStream(options);
        return new Promise<CloudStorageFileLocator>((res, rej) => {
            uploadStream.on("error", err => rej(err));
            uploadStream.write(Buffer.from(content, 'utf8'));
            uploadStream.end(() => res(fileLocator));
        });
    }
}