using System.Net.Http;
using System.Threading.Tasks;

namespace Mcma.Client
{
    public interface IAuthenticator
    {
        Task SignAsync(HttpRequestMessage request);
    }
}