using System;
using System.Net.Http;

namespace Mcma.Client
{
    public class ResourceManagerProvider : IResourceManagerProvider
    {
        public ResourceManagerProvider(IAuthProvider authProvider = null, ResourceManagerConfig defaultConfig = null)
        {
            AuthProvider = authProvider;
            DefaultConfig = defaultConfig;
        }

        private IAuthProvider AuthProvider { get; }

        private ResourceManagerConfig DefaultConfig { get; }

        public ResourceManager Get(HttpClient httpClient, ResourceManagerConfig config = null)
            => new ResourceManager(httpClient, ConfigOrDefault(config), AuthProvider);

        public ResourceManager Get(ResourceManagerConfig config = null)
            => new ResourceManager(ConfigOrDefault(config), AuthProvider);

        private ResourceManagerConfig ConfigOrDefault(ResourceManagerConfig config)
            => (config ?? DefaultConfig) ?? throw new Exception("Config for resource manager not provided, and there is no default config available");
    }
} 