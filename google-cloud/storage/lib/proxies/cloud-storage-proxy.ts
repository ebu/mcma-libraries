import { CloudStorageLocatorProperties } from "../cloud-storage-locator";
import { Bucket, Storage, StorageOptions } from "@google-cloud/storage";

export abstract class CloudStorageProxy<T extends CloudStorageLocatorProperties> {
    protected readonly storage: Storage;
    protected readonly bucket: Bucket;

    protected constructor(protected readonly locator: T, storageOrOptions: StorageOptions | Storage) {
        this.storage = storageOrOptions instanceof Storage ? storageOrOptions : new Storage(storageOrOptions);
        this.bucket = this.storage.bucket(locator.bucket);
    }
}