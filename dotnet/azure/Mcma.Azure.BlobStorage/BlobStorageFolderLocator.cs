namespace Mcma.Azure.BlobStorage
{
    public class BlobStorageFolderLocator : BlobStorageLocator
    {
        public string FolderPath { get; set; }

        public override string Url => $"http://{StorageAccountName}.blob.core.windows.net/{Container}/{FolderPath}";
    }
}
