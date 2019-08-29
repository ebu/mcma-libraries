using System;
using System.Linq;
using Mcma.Core;

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
    }
}
