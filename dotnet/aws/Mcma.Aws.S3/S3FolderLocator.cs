namespace Mcma.Aws.S3
{
    public class S3FolderLocator : S3Locator
    {
        public string KeyPrefix { get; set; }

        public override string Url => $"http://{Bucket}.s3.amazonaws.com/{KeyPrefix ?? string.Empty}";
    }
}