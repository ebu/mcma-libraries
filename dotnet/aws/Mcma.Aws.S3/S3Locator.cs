using System.Threading.Tasks;
using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Mcma.Core;

namespace Mcma.Aws.S3
{
    public class S3Locator : HttpEndpointLocator
    {
        public string AwsS3Bucket { get; set; }

        public string AwsS3Key { get; set; }

        public string AwsS3KeyPrefix { get; set; }

        public async Task<string> GetBucketLocationAsync()
            => (await new AmazonS3Client().GetBucketLocationAsync(AwsS3Bucket))?.Location?.Value;

        public async Task<IAmazonS3> GetClientAsync()
        {
            var bucketLocation = await GetBucketLocationAsync();
            
            return !string.IsNullOrWhiteSpace(bucketLocation)
                ? new AmazonS3Client(RegionEndpoint.GetBySystemName(bucketLocation))
                : new AmazonS3Client();
        }

        public async Task<GetObjectResponse> GetAsync()
        {
            var client = await GetClientAsync();

            return await client.GetObjectAsync(AwsS3Bucket, AwsS3Key);
        }
    }
}