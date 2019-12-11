namespace Mcma.Aws.S3
{
    public class AwsS3FolderLocator : AwsS3Locator
    {
        public string AwsS3KeyPrefix { get; set; }

        protected override string UrlPath => AwsS3KeyPrefix;
    }
}