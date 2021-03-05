import { CloudStorageLocator } from "../cloud-storage-locator";
import { Bucket, CreateWriteStreamOptions, File, Storage, StorageOptions } from "@google-cloud/storage";
import { buildCloudStorageUrl } from "../helpers";

export class CloudStorageProxy {
    private readonly storage: Storage;
    private readonly bucket: Bucket;
    private readonly file: File;

    constructor(private readonly locator: CloudStorageLocator, storageOrOptions: StorageOptions | Storage) {
        this.storage = storageOrOptions instanceof Storage ? storageOrOptions : new Storage(storageOrOptions);
        this.bucket = this.storage.bucket(locator.bucket);
        this.file = this.bucket.file(locator.filename);
    }

    async upload(filename: string, readFrom: NodeJS.ReadableStream, options?: CreateWriteStreamOptions): Promise<CloudStorageLocator> {
        const uploadStream = this.bucket.file(filename).createWriteStream(options);
        return new Promise<CloudStorageLocator>((resolve, reject) => {
            readFrom.on("end", () => resolve(new CloudStorageLocator({ url: buildCloudStorageUrl(this.locator.bucket, filename) })));
            readFrom.on("error", err => reject(err));
            readFrom.pipe(uploadStream);
        });
    }

    async uploadAsText(filename: string, content: string, options?: CreateWriteStreamOptions): Promise<CloudStorageLocator> {
        const uploadStream = this.bucket.file(filename).createWriteStream(options);
        return new Promise<CloudStorageLocator>((resolve, reject) => {
            uploadStream.on("error", err => reject(err));
            uploadStream.write(Buffer.from(content, "utf8"));
            uploadStream.end(() => resolve(new CloudStorageLocator({ url: buildCloudStorageUrl(this.locator.bucket, filename) })));
        });
    }

    async downloadToStream(writeStream: NodeJS.WritableStream): Promise<void> {
        const readStream = this.file.createReadStream();
        return new Promise<void>((resolve, reject) => {
            try {
                readStream.on("error", err => reject(err));
                readStream.on("end", () => resolve());
                readStream.pipe(writeStream);
            } catch (e) {
                reject(e);
            }
        });
    }

    async getPublicReadOnlyUrl(validFor?: number): Promise<string> {
        const [signedUrl] = await this.file.getSignedUrl({ action: "read", expires: Date.now() + (validFor ?? 15 * 60 * 1000) });
        return signedUrl;
    }
}
