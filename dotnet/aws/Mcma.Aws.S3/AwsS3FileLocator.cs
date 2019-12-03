namespace Mcma.Aws.S3
{
    public class AwsS3FileLocator : AwsS3Locator
    {
        public string Key { get; set; }

        protected override string UrlPath => Key;
    }
}