
using Mcma.Core.Context;

namespace Mcma.Client
{
    public static class ContextVariableProviderExtensions
    {
        public static ResourceManagerConfig GetResourceManagerConfig(this IContextVariables contextVariables)
            => new ResourceManagerConfig(contextVariables.GetRequired(nameof(ResourceManagerConfig.ServicesUrl)))
            {
                ServicesAuthType = contextVariables.GetOptional(nameof(ResourceManagerConfig.ServicesAuthType)),
                ServicesAuthContext = contextVariables.GetOptional(nameof(ResourceManagerConfig.ServicesAuthContext))
            };
    }
} 