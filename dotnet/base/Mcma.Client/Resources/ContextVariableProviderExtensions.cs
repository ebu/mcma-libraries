
using Mcma.Core.Context;

namespace Mcma.Client
{
    public static class ContextVariableProviderExtensions
    {
        public static ResourceManagerConfig GetResourceManagerConfig(this IContextVariableProvider contextVariableProvider)
            => new ResourceManagerConfig(
                contextVariableProvider.GetRequiredContextVariable(nameof(ResourceManagerConfig.ServicesUrl)),
                contextVariableProvider.GetOptionalContextVariable(nameof(ResourceManagerConfig.ServicesAuthType)),
                contextVariableProvider.GetOptionalContextVariable(nameof(ResourceManagerConfig.ServicesAuthContext)));
    }
} 