using System;
using Mcma.Core;
using Mcma.Core.Serialization;
using Mcma.Data;
using Microsoft.Azure.Cosmos;

namespace Mcma.Azure.CosmosDb
{
    public class CosmosDbTableProvider : IDbTableProvider, IDisposable
    {
        public CosmosDbTableProvider(CosmosDbTableProviderOptions options)
        {
            Options = options;

            CosmosClient =
                new CosmosClient(
                    options.Endpoint,
                    options.Key,
                    new CosmosClientOptions
                    {
                        ApplicationRegion = options.Region,
                        Serializer = new CosmosJsonDotNetSerializer(McmaJson.DefaultSettings())
                    });
        }

        private CosmosDbTableProviderOptions Options { get; }

        private CosmosClient CosmosClient { get; }

        public IDbTable<TResource, TPartitionKey> Get<TResource, TPartitionKey>(string tableName) where TResource : McmaResource
        {
            if (typeof(TPartitionKey) != typeof(Type) &&
                typeof(TPartitionKey) != typeof(string) &&
                typeof(TPartitionKey) != typeof(double) &&
                typeof(TPartitionKey) != typeof(bool))
                throw new NotSupportedException($"Type of {typeof(TPartitionKey).Name} is not a supported type for Cosmos DB partition keys.");

            return new CosmosDbTable<TResource, TPartitionKey>(
                CosmosClient,
                Options.DatabaseId,
                tableName ?? typeof(TResource).Name);
        }

        public void Dispose() => CosmosClient?.Dispose();
    }
}
