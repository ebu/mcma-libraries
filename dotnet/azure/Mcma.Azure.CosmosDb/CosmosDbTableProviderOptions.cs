using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;
using Mcma.Core;

namespace Mcma.Azure.CosmosDb
{
    public class CosmosDbTableProviderOptions
    {
        public CosmosDbTableProviderOptions()
        {
        }

        public CosmosDbTableProviderOptions(string endpoint, string key, string region, string databaseId, string idPrefix)
        {
            Endpoint = endpoint;
            Key = key;
            Region = region;
            DatabaseId = databaseId;
        }

        public string Endpoint { get; set; }

        public string Key { get; set; }

        public string Region { get; set; }

        public string DatabaseId { get; set; }

        public string IdPrefix { get; set; }

        private Dictionary<Type, string> PartitionKeyPathsByType { get; } = new Dictionary<Type, string>();

        private CosmosDbTableProviderOptions WithPartitionKey<TResource, TKey>(Expression<Func<TResource, TKey>> keySelector)
            where TResource : McmaResource
        {
            if (!(keySelector.Body is MemberExpression memberSelector) || !(memberSelector.Member is PropertyInfo property))
                throw new Exception("Partition key selector expression must be a property accessor.");

            return WithPartitionKey(keySelector);
        }

        private CosmosDbTableProviderOptions WithPartitionKey<TResource, TKey>(string partitionKeyPath)
            where TResource : McmaResource
        {
            PartitionKeyPathsByType[typeof(TResource)] = $"/{partitionKeyPath}";

            return this;
        }

        public CosmosDbTableProviderOptions WithPartitionKey<TResource>(Expression<Func<TResource, string>> keySelector)
            where TResource : McmaResource
            => WithPartitionKey<TResource, string>(keySelector);

        public CosmosDbTableProviderOptions WithPartitionKey<TResource>(Expression<Func<TResource, bool>> keySelector)
            where TResource : McmaResource
            => WithPartitionKey<TResource, bool>(keySelector);

        public CosmosDbTableProviderOptions WithPartitionKey<TResource>(Expression<Func<TResource, double>> keySelector)
            where TResource : McmaResource
            => WithPartitionKey<TResource, double>(keySelector);

        public CosmosDbTableProviderOptions WithResourceTypePartitionKey<TResource>()
            where TResource : McmaResource
            => WithPartitionKey<TResource, Type>(nameof(McmaResource.Type).ToLower());

        public string GetPartitionKeyPath<TResource>()
        {
            if (!PartitionKeyPathsByType.ContainsKey(typeof(TResource)))
                throw new Exception($"Partition key not configured for type {typeof(TResource).Name}.");

            return PartitionKeyPathsByType[typeof(TResource)];
        }
    }
}
