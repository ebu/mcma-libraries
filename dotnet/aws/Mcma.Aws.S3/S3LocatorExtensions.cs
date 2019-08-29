using System.Threading.Tasks;
using Amazon;
using Amazon.S3;
using Amazon.S3.Model;

namespace Mcma.Aws.S3
{
    public static class S3LocatorExtensions
    {
        public static async Task<string> GetBucketLocationAsync(this S3Locator s3Locator)
            => (await new AmazonS3Client().GetBucketLocationAsync(s3Locator.AwsS3Bucket))?.Location?.Value;

        public static async Task<IAmazonS3> GetClientAsync(this S3Locator s3Locator)
        {
            var bucketLocation = await s3Locator.GetBucketLocationAsync();
            
            return !string.IsNullOrWhiteSpace(bucketLocation)
                ? new AmazonS3Client(RegionEndpoint.GetBySystemName(bucketLocation))
                : new AmazonS3Client();
        }

        public static async Task<GetObjectResponse> GetAsync(this S3Locator s3Locator)
        {
            var client = await s3Locator.GetClientAsync();

            return await client.GetObjectAsync(s3Locator.AwsS3Bucket, s3Locator.AwsS3Key);
        }
    }
}