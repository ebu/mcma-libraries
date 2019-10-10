namespace Mcma.Azure.BlobStorage
{
    public static class BlobStorageLocatorExtensions
    {        
        public static BlobStorageFileLocator FileLocator(this BlobStorageFolderLocator folderLocator, string fileName)
            => new BlobStorageFileLocator
            {
                Container = folderLocator.Container,
                FilePath = (!string.IsNullOrWhiteSpace(folderLocator.FolderPath) ? "/" : "") + fileName
            };
    }
}
