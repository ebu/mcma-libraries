import { BlobServiceClient } from "@azure/storage-blob";
import { ConfigVariables, McmaException } from "@mcma/core";
import { BlobStorageLocator } from "../blob-storage-locator";
import { BlobStorageProxy } from "./blob-storage-proxy";

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

export function getProxy(locator: BlobStorageLocator, connectionString: string): BlobStorageProxy;
export function getProxy(locator: BlobStorageLocator, configVariables: ConfigVariables): BlobStorageProxy;
export function getProxy(locator: BlobStorageLocator, connectionStringOrConfigVariables: ConfigVariables | string): BlobStorageProxy {
    if (typeof connectionStringOrConfigVariables === "string") {
        return new BlobStorageProxy(locator, getBlobClient(connectionStringOrConfigVariables));
    } else {
        return new BlobStorageProxy(locator, getBlobClient(connectionStringOrConfigVariables, locator.account));
    }
}
