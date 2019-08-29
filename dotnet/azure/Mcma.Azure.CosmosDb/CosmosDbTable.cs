using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Mcma.Azure.CosmosDb.Json;
using Mcma.Core;
using Mcma.Core.Logging;
using Mcma.Core.Serialization;
using Mcma.Data;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Linq;
using Newtonsoft.Json;

namespace Mcma.Azure.CosmosDb
{
    public class CosmosDbTable<TResource, TPartitionKey> : IDbTable<TResource, TPartitionKey> where TResource : McmaResource
    {
        public CosmosDbTable(CosmosClient cosmosClient, string databaseId, string tableName, string partitionKeyPath)
        {
            CosmosClient = cosmosClient;
            DatabaseId = databaseId;
            TableName = tableName;
            PartitionKeyPath = partitionKeyPath;
        }

        private CosmosClient CosmosClient { get; }

        private string DatabaseId { get; }

        private string TableName { get; }

        private string PartitionKeyPath { get; }
        
        private Task<Container> ContainerTask { get; set; }

        private async Task<Container> GetContainerAsync()
        {
            if (ContainerTask == null)
            {
                Database db = await CosmosClient.CreateDatabaseIfNotExistsAsync(DatabaseId);
                
                ContainerTask =
                    db.CreateContainerIfNotExistsAsync(new ContainerProperties(TableName, PartitionKeyPath))
                        .ContinueWith(t => (Container)t.Result);
            }
            
            return await ContainerTask;
        }

        private async Task AddQueryResultsAsync(Expression<Func<TResource, bool>> filter, List<TResource> results, string continuationToken = null)
        {
            var container = await GetContainerAsync();

            IQueryable<TResource> query = container.GetItemLinqQueryable<TResource>();
            if (filter != null)
                query = query.Where(filter);
                
            var queryIterator = query.ToFeedIterator();

            while (queryIterator.HasMoreResults)
            {
                var resp = await queryIterator.ReadNextAsync();
                results.AddRange(resp.Resource);
                continuationToken = resp.ContinuationToken;
            }

            if (continuationToken != null)
                await AddQueryResultsAsync(filter, results, continuationToken);
        }

        public async Task<IEnumerable<TResource>> QueryAsync(Expression<Func<TResource, bool>> filter)
        {
            var results = new List<TResource>();

            await AddQueryResultsAsync(filter, results);

            return results;
        }
        
        public async Task<TResource> GetAsync(string id, TPartitionKey partitionKey)
        {
            var container = await GetContainerAsync();

            var resp = await container.ReadItemAsync<TResource>(Uri.EscapeDataString(id), GetPartitionKey(partitionKey));
            
            return resp.Resource;
        }

        public async Task<TResource> PutAsync(string id, TPartitionKey partitionKey, TResource resource)
        {
            if (resource.Id != id)
                resource.Id = id;
            
            var container = await GetContainerAsync();

            var resp = await container.UpsertItemAsync(resource, GetPartitionKey(partitionKey));
            Logger.Info("Upsert response from Cosmos DB: " + resp.ToMcmaJson().ToString());
            return resp.Resource;
        }

        public async Task DeleteAsync(string id, TPartitionKey partitionKey)
        {
            var container = await GetContainerAsync();

            await container.DeleteItemAsync<TResource>(Uri.EscapeDataString(id), GetPartitionKey(partitionKey));
        }

        private PartitionKey GetPartitionKey(TPartitionKey partitionKey)
        {
            if (partitionKey == null)
                return PartitionKey.Null;

            switch (partitionKey)
            {
                case Type partitionKeyType:
                    return new PartitionKey(partitionKeyType.Name);
                case string partitionKeyStr:
                    return new PartitionKey(partitionKeyStr);
                case bool partitionKeyBool:
                    return new PartitionKey(partitionKeyBool);
                case double partitionKeyDouble:
                    return new PartitionKey(partitionKeyDouble);
                default:
                    throw new NotSupportedException(
                        $"Partition key of type ");
            }
        }
    }
}
