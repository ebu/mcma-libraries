import { CloudStorageFileLocator } from "./cloud-storage-file-locator";
import { CloudStorageFolderLocatorProperties } from "./cloud-storage-folder-locator";

export function getFilePath(folderLocator: CloudStorageFolderLocatorProperties, fileName: string): string {
    if (!folderLocator.folderPath || !folderLocator.folderPath.length) {
        return fileName;
    }

    let folderPath = folderLocator.folderPath;
    if (!folderPath.endsWith("/")) {
        folderPath += "/";
    }
    return folderPath + fileName;
}

export function getFileLocator(folderLocator: CloudStorageFolderLocatorProperties, fileName: string): CloudStorageFileLocator {
    return new CloudStorageFileLocator({
        bucket: folderLocator.bucket,
        filePath: getFilePath(folderLocator, fileName)
    });
}