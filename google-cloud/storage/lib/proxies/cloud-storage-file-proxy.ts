import { File, Storage, StorageOptions } from "@google-cloud/storage";
import { CloudStorageFileLocatorProperties } from "../cloud-storage-file-locator";
import { CloudStorageProxy } from "./cloud-storage-proxy";

export class CloudStorageFileProxy extends CloudStorageProxy<CloudStorageFileLocatorProperties> {
    private readonly file: File;

    constructor(locator: CloudStorageFileLocatorProperties, storageOrOptions?: StorageOptions | Storage) {
        super(locator, storageOrOptions);
        this.file = this.bucket.file(locator.filePath)
    }

    async downloadToStream(writeStream: NodeJS.WritableStream): Promise<void> {
        const readStream = this.file.createReadStream();
        return new Promise<void>((res, rej) => {
            try {
                readStream.on("error", err => rej(err));
                readStream.on("end", () => res());
                readStream.pipe(writeStream);
            } catch (e) {
                rej(e);
            }
        });
    }

    async getPublicReadOnlyUrl(validFor?: number): Promise<string> {
        const [signedUrl] = await this.file.getSignedUrl({ action: "read", expires: Date.now() + (validFor ?? 15 * 60 * 1000) });
        return signedUrl;
    }
}
