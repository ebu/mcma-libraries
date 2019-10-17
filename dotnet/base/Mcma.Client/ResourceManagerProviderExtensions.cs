using Mcma.Core.Context;

namespace Mcma.Client
{
    public static class ResourceManagerProviderExtensions
    {
        public static ResourceManager Get(this IResourceManagerProvider resourceManagerProvider, string servicesUrl, string servicesAuthType = null, string servicesAuthContext = null)
            => resourceManagerProvider.Get(new ResourceManagerConfig(servicesUrl,  servicesAuthType,  servicesAuthContext));

        public static ResourceManager Get(this IResourceManagerProvider resourceManagerProvider, IContextVariables contextVariables)
            => resourceManagerProvider.Get(contextVariables.GetResourceManagerConfig()); 
    }
} 