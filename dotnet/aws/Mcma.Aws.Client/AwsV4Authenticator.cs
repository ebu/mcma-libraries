using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Mcma.Client;

namespace Mcma.Aws.Client
{
    public class AwsV4Authenticator : IAuthenticator
    {
        public AwsV4Authenticator(AwsV4AuthContext authContext)
        {
            Signer =
                new AwsV4Signer(
                    authContext.AccessKey,
                    authContext.SecretKey,
                    authContext.Region,
                    authContext.SessionToken);
        }

        private AwsV4Signer Signer { get; }

        public Task SignAsync(HttpRequestMessage request) => Signer.SignAsync(request, CancellationToken.None);
    }
}