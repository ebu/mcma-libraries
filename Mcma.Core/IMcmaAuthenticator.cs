using System.Net.Http;

namespace Mcma.Core
{
    public interface IMcmaAuthenticator
    {
        HttpClient CreateAuthenticatedClient();
    }
}