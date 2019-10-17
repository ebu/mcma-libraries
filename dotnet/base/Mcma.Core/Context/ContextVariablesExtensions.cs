using System.Collections.Generic;

namespace Mcma.Core.Context
{
    public static class ContextVariablesExtensions
    {
        public static string TableName(this IContextVariables contextVariables)
            => contextVariables.GetRequired(nameof(TableName));

        public static IDictionary<string, string> ToDictionary(this IContextVariables contextVariables)
            => contextVariables.GetAll().ToDictionary();
    }
}