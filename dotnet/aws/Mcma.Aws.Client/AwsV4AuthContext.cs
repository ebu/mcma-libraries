namespace Mcma.Aws.Client
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

        public static AwsV4AuthContext Global { get; } =
            new AwsV4AuthContext(
                AwsEnvironmentVariables.AccessKey,
                AwsEnvironmentVariables.SecretKey,
                AwsEnvironmentVariables.Region,
                AwsEnvironmentVariables.SessionToken);
    }
}