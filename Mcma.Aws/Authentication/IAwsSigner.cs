
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Mcma.Aws.Authentication
{
    public interface IAwsSigner
    {
        Task<HttpRequestMessage> SignAsync(HttpRequestMessage request, CancellationToken cancellationToken);
    }
}