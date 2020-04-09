import { BlobServiceClient } from "@azure/storage-blob";
import { ContextVariableProvider, McmaException } from "@mcma/core";
import { BlobStorageFileProxy } from "./blob-storage-file-proxy";
import { BlobStorageFileLocator } from "../blob-storage-file-locator";
import { BlobStorageFolderProxy } from "./blob-storage-folder-proxy";
import { BlobStorageFolderLocator } from "../blob-storage-folder-locator";

const StorageAccountNameKeySuffix = "StorageAccountName";
const StorageConnectionStringKeySuffix = "StorageConnectionString";

export function getBlobClient(connectionString: string): BlobServiceClient;
export function getBlobClient(contextVariableProvider: ContextVariableProvider, storageAccountName: string): BlobServiceClient;
export function getBlobClient(connectionStringOrContextVariableProvider: ContextVariableProvider | string, storageAccountName?: string): BlobServiceClient {
    if (typeof connectionStringOrContextVariableProvider === "string") {
        return BlobServiceClient.fromConnectionString(connectionStringOrContextVariableProvider);
    }

    const contextVariableProvider = connectionStringOrContextVariableProvider;
    const allContextVariables = contextVariableProvider.getAllContextVariables();

    const accountNameSettingKey =
        Object.keys(allContextVariables)
            .filter(key => !key.startsWith("APPSETTING_"))
            .find(key =>
                key.toLowerCase().endsWith(StorageAccountNameKeySuffix.toLowerCase()) &&
                allContextVariables[key].toLowerCase() === storageAccountName.toLowerCase());

    if (!accountNameSettingKey)
        throw new McmaException(`Storage account '${storageAccountName}' is not configured.`);
    
    return getBlobClient(
        contextVariableProvider.getRequiredContextVariable(
            accountNameSettingKey.substr(0, accountNameSettingKey.length - StorageAccountNameKeySuffix.length) + StorageConnectionStringKeySuffix));
}

export function getFileProxy(locator: BlobStorageFileLocator, connectionString: string): BlobStorageFileProxy;
export function getFileProxy(locator: BlobStorageFileLocator, contextVariableProvider: ContextVariableProvider): BlobStorageFileProxy;
export function getFileProxy(locator: BlobStorageFileLocator, connectionStringOrContextVariableProvider: ContextVariableProvider | string): BlobStorageFileProxy {
    if (typeof connectionStringOrContextVariableProvider === "string") {
        return new BlobStorageFileProxy(locator, getBlobClient(connectionStringOrContextVariableProvider));
    } else {
        return new BlobStorageFileProxy(locator, getBlobClient(connectionStringOrContextVariableProvider, locator.storageAccountName));
    }
}

export function getFolderProxy(locator: BlobStorageFolderLocator, connectionString: string): BlobStorageFolderProxy;
export function getFolderProxy(locator: BlobStorageFolderLocator, contextVariableProvider: ContextVariableProvider): BlobStorageFolderProxy;
export function getFolderProxy(locator: BlobStorageFolderLocator, connectionStringOrContextVariableProvider: ContextVariableProvider | string): BlobStorageFolderProxy {
    if (typeof connectionStringOrContextVariableProvider === "string") {
        return new BlobStorageFolderProxy(locator, getBlobClient(connectionStringOrContextVariableProvider));
    } else {
        return new BlobStorageFolderProxy(locator, getBlobClient(connectionStringOrContextVariableProvider, locator.storageAccountName));
    }
}