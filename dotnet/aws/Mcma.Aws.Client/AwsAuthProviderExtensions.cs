
using System;
using Mcma.Client;

namespace Mcma.Aws.Client
{
    public static class AwsAuthProviderExtensions
    {
        public static IAuthProvider AddAwsV4Auth(this IAuthProvider authProvider, AwsV4AuthContext defaultContext = null)
            =>
            authProvider.Add<AwsV4AuthContext>(
                AwsConstants.AWS4,
                authContext =>
                {
                    authContext = authContext ?? defaultContext;
                    if (authContext == null)
                        throw new Exception("Auth context for AWSV4 was not provided, and a global AWS config is not available as a default.");

                    return new AwsV4Authenticator(authContext);
                });
    }
}