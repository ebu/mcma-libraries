using Mcma.Core.ContextVariables;

namespace Mcma.Client
{
    public static class ResourceManagerProviderExtensions
    {
        public static ResourceManager Get(this IResourceManagerProvider resourceManagerProvider, string servicesUrl, string servicesAuthType = null, string servicesAuthContext = null)
            => resourceManagerProvider.Get(new ResourceManagerConfig(servicesUrl,  servicesAuthType,  servicesAuthContext));

        public static ResourceManager Get(this IResourceManagerProvider resourceManagerProvider, IContextVariableProvider contextVariableProvider)
            => resourceManagerProvider.Get(contextVariableProvider.GetResourceManagerConfig()); 
    }
} 