using Mcma.Core;

namespace Mcma.Aws.S3
{
    public class S3Locator : HttpEndpointLocator
    {
        public string AwsS3Bucket { get; set; }

        public string AwsS3Key { get; set; }

        public string AwsS3KeyPrefix { get; set; }
    }
}