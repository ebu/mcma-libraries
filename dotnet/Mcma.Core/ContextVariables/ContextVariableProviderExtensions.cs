namespace Mcma.Core.ContextVariables
{
    public static class ContextVariableProviderExtensions
    {
        public static string TableName(this IContextVariableProvider contextVariableProvider)
            => contextVariableProvider.GetRequiredContextVariable(nameof(TableName));
    }
}