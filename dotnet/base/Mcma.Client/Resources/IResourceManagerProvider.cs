using System.Net.Http;

namespace Mcma.Client
{
    public interface IResourceManagerProvider
    {
        IResourceManager Get(HttpClient httpClient, ResourceManagerConfig config = null);

        IResourceManager Get(ResourceManagerConfig config = null);
    }
} 