namespace Mcma.Aws.S3
{
    public class S3FileLocator : S3Locator
    {
        public string Key { get; set; }

        public override string Url => $"http://{Bucket}.s3.amazonaws.com/{Key}";
    }
}