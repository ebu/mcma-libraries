
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Mcma.Aws.Authentication
{
    public class AwsSigningHttpClientHandler : HttpClientHandler
    {
        public AwsSigningHttpClientHandler(IAwsSigner awsSigner)
        {
            AwsSigner = awsSigner;
        }

        private IAwsSigner AwsSigner { get; }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            await AwsSigner.SignAsync(request, cancellationToken);

            return await base.SendAsync(request, cancellationToken);
        }
    }
}