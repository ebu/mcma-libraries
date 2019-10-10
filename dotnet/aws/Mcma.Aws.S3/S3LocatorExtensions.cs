using System.Threading.Tasks;
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;

namespace Mcma.Aws.S3
{
    public static class S3LocatorExtensions
    {
        public static async Task<string> GetBucketLocationAsync(this S3Locator s3Locator)
            => (await new AmazonS3Client().GetBucketLocationAsync(s3Locator.Bucket))?.Location?.Value;

        public static async Task<IAmazonS3> GetBucketClientAsync(this S3Locator s3Locator)
        {
            var bucketLocation = await s3Locator.GetBucketLocationAsync();
            
            return !string.IsNullOrWhiteSpace(bucketLocation)
                ? new AmazonS3Client(RegionEndpoint.GetBySystemName(bucketLocation))
                : new AmazonS3Client();
        }

        public static async Task<IAmazonS3> GetBucketClientAsync(this S3Locator s3Locator, string accessKey, string secretKey)
        {
            var bucketLocation = await s3Locator.GetBucketLocationAsync();
            
            return !string.IsNullOrWhiteSpace(bucketLocation)
                ? new AmazonS3Client(new BasicAWSCredentials(accessKey, secretKey), RegionEndpoint.GetBySystemName(bucketLocation))
                : new AmazonS3Client(new BasicAWSCredentials(accessKey, secretKey));
        }

        public static async Task<GetObjectResponse> GetAsync(this S3FileLocator s3Locator)
        {
            var client = await s3Locator.GetBucketClientAsync();

            return await client.GetObjectAsync(s3Locator.Bucket, s3Locator.Key);
        }
    }
}