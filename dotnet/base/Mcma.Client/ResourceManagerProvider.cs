using System;

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

        public ResourceManager Get(ResourceManagerConfig config = null)
        {
            config = config ?? DefaultConfig;
            if (config == null)
                throw new Exception("Config for resource manager not provided, and there is no default config available");
            
            return new ResourceManager(config, AuthProvider);
        }
    }
} 