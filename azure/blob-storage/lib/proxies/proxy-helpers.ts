import { BlobServiceClient } from "@azure/storage-blob";
import { ConfigVariables, McmaException } from "@mcma/core";
import { BlobStorageFileProxy } from "./blob-storage-file-proxy";
import { BlobStorageFileLocator } from "../blob-storage-file-locator";
import { BlobStorageFolderProxy } from "./blob-storage-folder-proxy";
import { BlobStorageFolderLocator } from "../blob-storage-folder-locator";

const StorageAccountNameKeySuffix = "StorageAccountName";
const StorageConnectionStringKeySuffix = "StorageConnectionString";

export function getBlobClient(connectionString: string): BlobServiceClient;
export function getBlobClient(configVariables: ConfigVariables, storageAccountName: string): BlobServiceClient;
export function getBlobClient(connectionStringOrConfigVariables: ConfigVariables | string, storageAccountName?: string): BlobServiceClient {
    if (typeof connectionStringOrConfigVariables === "string") {
        return BlobServiceClient.fromConnectionString(connectionStringOrConfigVariables);
    }

    const configVariables = connectionStringOrConfigVariables;

    const accountNameSettingKey =
        configVariables.keys()
                            .filter(key => !key.startsWith("APPSETTING_"))
                            .find(key => key.toLowerCase().endsWith(StorageAccountNameKeySuffix.toLowerCase()) &&
                                         configVariables.get(key).toLowerCase() === storageAccountName.toLowerCase());

    if (!accountNameSettingKey)
        throw new McmaException(`Storage account '${storageAccountName}' is not configured.`);

    return getBlobClient(
        configVariables.get(
            accountNameSettingKey.substr(0, accountNameSettingKey.length - StorageAccountNameKeySuffix.length) + StorageConnectionStringKeySuffix));
}

export function getFileProxy(locator: BlobStorageFileLocator, connectionString: string): BlobStorageFileProxy;
export function getFileProxy(locator: BlobStorageFileLocator, configVariables: ConfigVariables): BlobStorageFileProxy;
export function getFileProxy(locator: BlobStorageFileLocator, connectionStringOrConfigVariables: ConfigVariables | string): BlobStorageFileProxy {
    if (typeof connectionStringOrConfigVariables === "string") {
        return new BlobStorageFileProxy(locator, getBlobClient(connectionStringOrConfigVariables));
    } else {
        return new BlobStorageFileProxy(locator, getBlobClient(connectionStringOrConfigVariables, locator.storageAccountName));
    }
}

export function getFolderProxy(locator: BlobStorageFolderLocator, connectionString: string): BlobStorageFolderProxy;
export function getFolderProxy(locator: BlobStorageFolderLocator, configVariables: ConfigVariables): BlobStorageFolderProxy;
export function getFolderProxy(locator: BlobStorageFolderLocator, connectionStringOrConfigVariables: ConfigVariables | string): BlobStorageFolderProxy {
    if (typeof connectionStringOrConfigVariables === "string") {
        return new BlobStorageFolderProxy(locator, getBlobClient(connectionStringOrConfigVariables));
    } else {
        return new BlobStorageFolderProxy(locator, getBlobClient(connectionStringOrConfigVariables, locator.storageAccountName));
    }
}
