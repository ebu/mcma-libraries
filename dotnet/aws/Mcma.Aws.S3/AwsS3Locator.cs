using Mcma;

namespace Mcma.Aws.S3
{
    public abstract class AwsS3Locator : Locator, IUrlLocator
    {
        public string AwsS3Bucket { get; set; }

        public string Url => $"http://{AwsS3Bucket}.s3.amazonaws.com/{UrlPath}";

        protected abstract string UrlPath { get; }
    }
}