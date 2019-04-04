

namespace Mcma.Aws.Authentication
{

    public static class AwsConstants
    {
        public static class Regions
        {
            public const string UsEast1 = "us-east-1";
            public const string UsEast2 = "us-east-2";
            public const string UsWest1 = "us-west-1";
            public const string UsWest2 = "us-west-2";
            public const string ApSouth1 = "ap-south-1";
            public const string ApNortheast1 = "ap-northeast-1";
            public const string ApNortheast2 = "ap-northeast-2";
            public const string ApSoutheast1 = "ap-southeast-1";
            public const string ApSoutheast2 = "ap-southeast-2";
            public const string CaCentral1 = "ca-central-1";
            public const string CnNorth1 = "cn-north-1";
            public const string EuCentral1 = "eu-central-1";
            public const string EuWest1 = "eu-west-1";
            public const string EuWest2 = "eu-west-2";
            public const string EuWest3 = "eu-west-3";
            public const string SaEast1 = "sa-east-1";
            public const string UsGovWest1 = "us-gov-west-1";
        }

        public static class Services
        {
            public const string ExecuteApi = "execute-api";
        }

        public static class Headers
        {
            public const string Prefix = "X-Amz-";

            public static string PrefixedHeader(string name) => $"{Prefix}{name}";

            public static readonly string Date = PrefixedHeader(nameof(Date));
            
            public static readonly string SecurityToken = PrefixedHeader("Security-Token");
        }

        public static class Signing
        {
            public const string Algorithm = "AWS4-HMAC-SHA256";

            public const string SecretKeyPrefix = "AWS4";

            public const string ScopeTerminator = "aws4_request";
        }

        public const string AWS4 = "AWS4";
    }
}