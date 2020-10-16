import { BlobServiceClient } from "@azure/storage-blob";
import { EnvironmentVariables, McmaException } from "@mcma/core";
import { BlobStorageFileProxy } from "./blob-storage-file-proxy";
import { BlobStorageFileLocator } from "../blob-storage-file-locator";
import { BlobStorageFolderProxy } from "./blob-storage-folder-proxy";
import { BlobStorageFolderLocator } from "../blob-storage-folder-locator";

const StorageAccountNameKeySuffix = "StorageAccountName";
const StorageConnectionStringKeySuffix = "StorageConnectionString";

export function getBlobClient(connectionString: string): BlobServiceClient;
export function getBlobClient(environmentVariables: EnvironmentVariables, storageAccountName: string): BlobServiceClient;
export function getBlobClient(connectionStringOrEnvironmentVariables: EnvironmentVariables | string, storageAccountName?: string): BlobServiceClient {
    if (typeof connectionStringOrEnvironmentVariables === "string") {
        return BlobServiceClient.fromConnectionString(connectionStringOrEnvironmentVariables);
    }

    const environmentVariables = connectionStringOrEnvironmentVariables;

    const accountNameSettingKey =
        environmentVariables.keys()
                            .filter(key => !key.startsWith("APPSETTING_"))
                            .find(key => key.toLowerCase().endsWith(StorageAccountNameKeySuffix.toLowerCase()) &&
                                         environmentVariables.get(key).toLowerCase() === storageAccountName.toLowerCase());

    if (!accountNameSettingKey)
        throw new McmaException(`Storage account '${storageAccountName}' is not configured.`);

    return getBlobClient(
        environmentVariables.get(
            accountNameSettingKey.substr(0, accountNameSettingKey.length - StorageAccountNameKeySuffix.length) + StorageConnectionStringKeySuffix));
}

export function getFileProxy(locator: BlobStorageFileLocator, connectionString: string): BlobStorageFileProxy;
export function getFileProxy(locator: BlobStorageFileLocator, environmentVariables: EnvironmentVariables): BlobStorageFileProxy;
export function getFileProxy(locator: BlobStorageFileLocator, connectionStringOrEnvironmentVariables: EnvironmentVariables | string): BlobStorageFileProxy {
    if (typeof connectionStringOrEnvironmentVariables === "string") {
        return new BlobStorageFileProxy(locator, getBlobClient(connectionStringOrEnvironmentVariables));
    } else {
        return new BlobStorageFileProxy(locator, getBlobClient(connectionStringOrEnvironmentVariables, locator.storageAccountName));
    }
}

export function getFolderProxy(locator: BlobStorageFolderLocator, connectionString: string): BlobStorageFolderProxy;
export function getFolderProxy(locator: BlobStorageFolderLocator, environmentVariables: EnvironmentVariables): BlobStorageFolderProxy;
export function getFolderProxy(locator: BlobStorageFolderLocator, connectionStringOrEnvironmentVariables: EnvironmentVariables | string): BlobStorageFolderProxy {
    if (typeof connectionStringOrEnvironmentVariables === "string") {
        return new BlobStorageFolderProxy(locator, getBlobClient(connectionStringOrEnvironmentVariables));
    } else {
        return new BlobStorageFolderProxy(locator, getBlobClient(connectionStringOrEnvironmentVariables, locator.storageAccountName));
    }
}
