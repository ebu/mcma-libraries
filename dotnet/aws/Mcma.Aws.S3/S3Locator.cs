using Mcma.Core;

namespace Mcma.Aws.S3
{
    public abstract class S3Locator : IUrlLocator
    {
        public string Bucket { get; set; }

        public abstract string Url { get; }
    }
}