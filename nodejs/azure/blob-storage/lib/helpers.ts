import { BlobStorageFileLocator } from "./blob-storage-file-locator";
import { BlobStorageFolderLocator } from "./blob-storage-folder-locator";

export function getFilePath(folderLocator: BlobStorageFolderLocator, fileName: string): string {
    if (!folderLocator.folderPath || !folderLocator.folderPath.length) {
        return fileName;
    }

    let folderPath = folderLocator.folderPath;
    if (!folderPath.endsWith("/")) {
        folderPath += "/";
    }
    return folderPath + fileName;
}

export function getFileLocator(folderLocator: BlobStorageFolderLocator, fileName: string): BlobStorageFileLocator {
    return new BlobStorageFileLocator({
        storageAccountName: folderLocator.storageAccountName,
        container: folderLocator.container,
        filePath: getFilePath(folderLocator, fileName)
    });
}