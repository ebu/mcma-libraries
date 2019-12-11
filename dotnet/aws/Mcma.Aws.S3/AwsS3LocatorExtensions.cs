using System.IO;
using System.Threading.Tasks;
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;

namespace Mcma.Aws.S3
{
    public static class AwsS3LocatorExtensions
    {
        public static async Task<string> GetBucketLocationAsync(this AwsS3Locator s3Locator)
        {
            using (var s3Client = new AmazonS3Client(RegionEndpoint.USEast1))
                return (await s3Client.GetBucketLocationAsync(s3Locator.AwsS3Bucket))?.Location?.Value;
        }

        public static async Task<string> GetBucketLocationAsync(this AwsS3Locator s3Locator, string accessKey, string secretKey)
        {
            using (var s3Client = new AmazonS3Client(new BasicAWSCredentials(accessKey, secretKey), RegionEndpoint.USEast1))
                return (await s3Client.GetBucketLocationAsync(s3Locator.AwsS3Bucket))?.Location?.Value;
        }

        public static async Task<IAmazonS3> GetBucketClientAsync(this AwsS3Locator s3Locator)
        {
            var bucketLocation = await s3Locator.GetBucketLocationAsync();
            
            return !string.IsNullOrWhiteSpace(bucketLocation)
                ? new AmazonS3Client(RegionEndpoint.GetBySystemName(bucketLocation))
                : new AmazonS3Client(RegionEndpoint.USEast1);
        }

        public static async Task<IAmazonS3> GetBucketClientAsync(this AwsS3Locator s3Locator, string accessKey, string secretKey)
        {
            var bucketLocation = await s3Locator.GetBucketLocationAsync(accessKey, secretKey);
            
            return !string.IsNullOrWhiteSpace(bucketLocation)
                ? new AmazonS3Client(new BasicAWSCredentials(accessKey, secretKey), RegionEndpoint.GetBySystemName(bucketLocation))
                : new AmazonS3Client(new BasicAWSCredentials(accessKey, secretKey), RegionEndpoint.USEast1);
        }

        public static async Task<GetObjectResponse> GetAsync(this AwsS3FileLocator s3Locator)
        {
            using (var client = await s3Locator.GetBucketClientAsync())
                return await client.GetObjectAsync(s3Locator.AwsS3Bucket, s3Locator.AwsS3Key);
        }

        public static async Task<GetObjectResponse> GetAsync(this AwsS3FileLocator s3Locator, string accessKey, string secretKey)
        {
            using (var client = await s3Locator.GetBucketClientAsync(accessKey, secretKey))
                return await client.GetObjectAsync(s3Locator.AwsS3Bucket, s3Locator.AwsS3Key);
        }

        public static async Task<Stream> GetStreamAsync(this AwsS3FileLocator s3Locator)
        {
            using (var client = await s3Locator.GetBucketClientAsync())
                return await client.GetObjectStreamAsync(s3Locator.AwsS3Bucket, s3Locator.AwsS3Key, null);
        }

        public static async Task<Stream> GetStreamAsync(this AwsS3FileLocator s3Locator, string accessKey, string secretKey)
        {
            using (var client = await s3Locator.GetBucketClientAsync(accessKey, secretKey))
                return await client.GetObjectStreamAsync(s3Locator.AwsS3Bucket, s3Locator.AwsS3Key, null);
        }

        public static async Task PutStreamAsync(this AwsS3FileLocator s3Locator, Stream inputStream, string contentType = null)
        {
            using (var client = await s3Locator.GetBucketClientAsync())
                await client.PutObjectAsync(
                    new PutObjectRequest
                    {
                        BucketName = s3Locator.AwsS3Bucket,
                        Key = s3Locator.AwsS3Key,
                        InputStream = inputStream,
                        AutoCloseStream = true,
                        ContentType = contentType
                    });
        }

        public static async Task PutStreamAsync(this AwsS3FileLocator s3Locator, string accessKey, string secretKey, Stream inputStream, string contentType = null)
        {
            using (var client = await s3Locator.GetBucketClientAsync(accessKey, secretKey))
                await client.PutObjectAsync(
                    new PutObjectRequest
                    {
                        BucketName = s3Locator.AwsS3Bucket,
                        Key = s3Locator.AwsS3Key,
                        InputStream = inputStream,
                        AutoCloseStream = true,
                        ContentType = contentType
                    });
        }
    }
}