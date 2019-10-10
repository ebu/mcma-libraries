using System.Collections.Generic;

namespace Mcma.Core.ContextVariables
{
    public static class ContextVariableProviderExtensions
    {
        public static string TableName(this IContextVariableProvider contextVariableProvider)
            => contextVariableProvider.GetRequiredContextVariable(nameof(TableName));

        public static IDictionary<string, string> ToDictionary(this IContextVariableProvider contextVariableProvider)
            => contextVariableProvider.GetAllContextVariables().ToDictionary();
    }
}