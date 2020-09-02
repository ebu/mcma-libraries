using Mcma.Context;

namespace Mcma.Client
{
    public static class ResourceManagerProviderExtensions
    {
        public static IResourceManager Get(this IResourceManagerProvider resourceManagerProvider, string servicesUrl, string servicesAuthType = null, string servicesAuthContext = null)
            => resourceManagerProvider.Get(new ResourceManagerConfig(servicesUrl, servicesAuthType, servicesAuthContext));

        public static IResourceManager Get(this IResourceManagerProvider resourceManagerProvider, IContextVariableProvider contextVariableProvider)
            => resourceManagerProvider.Get(contextVariableProvider.GetResourceManagerConfig()); 
    }
} 