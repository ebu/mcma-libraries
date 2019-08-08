using System;

namespace Mcma.Aws.Client
{
    public static class AwsEnvironmentVariables
    {
        public static string AccessKey => Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID");

        public static string SecretKey => Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY");//Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY ");

        public static string SessionToken => Environment.GetEnvironmentVariable("AWS_SESSION_TOKEN");

        public static string Region => Environment.GetEnvironmentVariable("AWS_REGION") ?? Environment.GetEnvironmentVariable("AWS_DEFAULT_REGION");
    }
}