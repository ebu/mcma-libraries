namespace Mcma.Azure.BlobStorage
{
    public class BlobStorageFileLocator : BlobStorageLocator
    {
        public string FilePath { get; set; }

        public override string Url => $"http://{StorageAccountName}.blob.core.windows.net/{Container}/{FilePath}";
    }
}
