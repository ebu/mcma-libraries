using System.Net.Http;

namespace Mcma.Client
{
    public interface IResourceManagerProvider
    {
        ResourceManager Get(HttpClient httpClient, ResourceManagerConfig config = null);

        ResourceManager Get(ResourceManagerConfig config = null);
    }
} 