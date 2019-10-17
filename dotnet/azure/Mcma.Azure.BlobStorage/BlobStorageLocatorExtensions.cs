namespace Mcma.Azure.BlobStorage
{
    public static class BlobStorageLocatorExtensions
    {
        public static string FilePath(this BlobStorageFolderLocator folderLocator, string fileName)
            => folderLocator.FolderPath?.TrimEnd('/') + (!string.IsNullOrWhiteSpace(folderLocator.FolderPath) ? "/" : "") + fileName;

        public static BlobStorageFileLocator FileLocator(this BlobStorageFolderLocator folderLocator, string fileName)
            => new BlobStorageFileLocator
            {
                StorageAccountName = folderLocator.StorageAccountName,
                Container = folderLocator.Container,
                FilePath = folderLocator.FilePath(fileName)
            };
    }
}
