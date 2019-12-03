using Mcma.Core;

namespace Mcma.Aws.S3
{
    public abstract class AwsS3Locator : IUrlLocator
    {
        public string Bucket { get; set; }

        public string Url => $"http://{Bucket}.s3.amazonaws.com/{UrlPath}";

        protected abstract string UrlPath { get; }
    }
}