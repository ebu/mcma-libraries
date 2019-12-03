namespace Mcma.Aws.S3
{
    public class AwsS3FolderLocator : AwsS3Locator
    {
        public string KeyPrefix { get; set; }

        protected override string UrlPath => KeyPrefix;
    }
}