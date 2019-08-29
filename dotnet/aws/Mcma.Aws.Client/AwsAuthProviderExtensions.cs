
using System;
using System.Threading.Tasks;
using Mcma.Client;
using Mcma.Core.Serialization;
using Newtonsoft.Json.Linq;

namespace Mcma.Aws.Client
{
    public static class AwsAuthProviderExtensions
    {
        public static IAuthProvider AddAwsV4Auth(this IAuthProvider authProvider, AwsV4AuthContext defaultContext = null)
            =>
            authProvider.Add(
                AwsConstants.AWS4,
                authContext =>
                {
                    var awsV4AuthContext =
                        !string.IsNullOrWhiteSpace(authContext)
                            ? JObject.Parse(authContext).ToMcmaObject<AwsV4AuthContext>()
                            : defaultContext;
            
                    if (awsV4AuthContext == null)
                        throw new Exception("Auth context for AWSV4 was not provided, and a global AWS config is not available as a default.");

                    return Task.FromResult<IAuthenticator>(new AwsV4Authenticator(awsV4AuthContext));
                });
    }
}