import { BlobServiceClient, ContainerClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { BlobStorageLocator } from "../blob-storage-locator";

export abstract class BlobStorageProxy<T extends BlobStorageLocator> {
    public container: ContainerClient;
    protected credential: StorageSharedKeyCredential;

    protected constructor(public locator: T, public client: BlobServiceClient) {
        this.container = this.client.getContainerClient(locator.container);
        this.credential = this.client.credential as StorageSharedKeyCredential;
    }
}

