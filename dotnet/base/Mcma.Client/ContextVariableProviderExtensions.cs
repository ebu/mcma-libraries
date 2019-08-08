
using Mcma.Core.ContextVariables;

namespace Mcma.Client
{
    public static class ContextVariableProviderExtensions
    {
        public static ResourceManagerConfig GetResourceManagerConfig(this IContextVariableProvider contextVariableProvider)
            => new ResourceManagerConfig(contextVariableProvider.GetRequiredContextVariable(nameof(ResourceManagerConfig.ServicesUrl)))
            {
                ServicesAuthType = contextVariableProvider.GetOptionalContextVariable(nameof(ResourceManagerConfig.ServicesAuthType)),
                ServicesAuthContext = contextVariableProvider.GetOptionalContextVariable(nameof(ResourceManagerConfig.ServicesAuthContext))
            };
    }
} 