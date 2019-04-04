namespace Mcma.Aws.Authentication
{
    public class AwsV4AuthContext
    {
        public AwsV4AuthContext()
        {
        }

        public AwsV4AuthContext(string accessKey, string secretKey, string region, string sessionToken = null)
        {
            AccessKey = accessKey;
            SecretKey = secretKey;
            Region = region;
            SessionToken = sessionToken;
        }

        public string AccessKey { get; set; }

        public string SecretKey { get; set; }

        public string Region { get; set; }

        public string SessionToken { get; set; }
    }
}