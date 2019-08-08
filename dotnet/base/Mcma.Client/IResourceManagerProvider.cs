namespace Mcma.Client
{
    public interface IResourceManagerProvider
    {
        ResourceManager Get(ResourceManagerConfig config = null);
    }
} 