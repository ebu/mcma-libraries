using System;
using System.Linq;
using Mcma.Core;
using Mcma.Core.ContextVariables;
using Mcma.Core.Utility;

namespace Mcma.Azure.CosmosDb
{
    public static class CosmosDbTableProviderOptionsExtensions
    {
        private const string Prefix = "CosmosDb";

        public static CosmosDbTableProviderOptions FromEnvironmentVariables(this CosmosDbTableProviderOptions options)
        {
            foreach (var prop in typeof(CosmosDbTableProviderOptions).GetProperties().Where(p => p.CanWrite))
                prop.SetValue(options, Environment.GetEnvironmentVariable(Prefix + prop.Name));

            return options;
        }

        public static CosmosDbTableProviderOptions FromContextVariables(this CosmosDbTableProviderOptions options, IContextVariableProvider contextVariableProvider)
        {
            foreach (var prop in typeof(CosmosDbTableProviderOptions).GetProperties().Where(p => p.CanWrite))
            {
                var contextVariableValue = contextVariableProvider.GetRequiredContextVariable(Prefix + prop.Name);
                if (!contextVariableValue.TryParse(prop.PropertyType, out var propValue))
                    throw new Exception($"Context variable '{Prefix + prop.Name}' has invalid value '{contextVariableValue}' for Cosmos DB option '{prop.Name}'.");

                prop.SetValue(options, propValue);
            }

            return options;
        }
    }
}
