
using System.Net.Http;
using Mcma.Core;

namespace Mcma.Aws.Authentication
{
    public class AwsV4Authenticator : IMcmaAuthenticator
    {
        public AwsV4Authenticator(AwsV4AuthContext authContext)
        {
            AuthContext = authContext;
        }

        private AwsV4AuthContext AuthContext { get; }

        public HttpClient CreateAuthenticatedClient()
            =>
            new HttpClient(
                new AwsSigningHttpClientHandler(
                    new AwsV4Signer(AuthContext.AccessKey, AuthContext.SecretKey, AuthContext.Region, AuthContext.SessionToken)));
    }
}