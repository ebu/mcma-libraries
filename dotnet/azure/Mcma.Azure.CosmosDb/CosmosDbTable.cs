using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Threading.Tasks;
using Mcma.Azure.CosmosDb.FilterExpressions;
using Mcma.Core;
using Mcma.Core.Serialization;
using Mcma.Core.Utility;
using Mcma.Data;
using Microsoft.Azure.Cosmos;
using Newtonsoft.Json.Linq;

namespace Mcma.Azure.CosmosDb
{
    public class CosmosDbTable<TResource, TPartitionKey> : IDbTable<TResource, TPartitionKey> where TResource : McmaResource
    {
        public CosmosDbTable(CosmosClient cosmosClient, string databaseId, string tableName)
        {
            CosmosClient = cosmosClient;
            DatabaseId = databaseId;
            TableName = tableName;
        }

        private CosmosClient CosmosClient { get; }

        private string DatabaseId { get; }

        private string TableName { get; }
        
        private Task<Container> ContainerTask { get; set; }

        private async Task<Container> GetContainerAsync()
        {
            if (ContainerTask == null)
            {
                Database db = await CosmosClient.CreateDatabaseIfNotExistsAsync(DatabaseId);
                
                ContainerTask =
                    db.CreateContainerIfNotExistsAsync(
                            new ContainerProperties(
                                TableName,
                                $"/{nameof(CosmosDbItem<TResource, TPartitionKey>.PartitionKey).PascalCaseToCamelCase()}"))
                        .ContinueWith(t => (Container)t.Result);
            }
            
            return await ContainerTask;
        }

        private async Task AddQueryResultsAsync(Expression<Func<TResource, bool>> filter, List<TResource> results, string continuationToken = null)
        {
            var container = await GetContainerAsync();

            // This currently does not work due to issues with camel-case in the V3 Cosmos DB SDK:
            // https://github.com/Azure/azure-cosmos-dotnet-v3/issues/570
            // The fix is awaiting release, so once the new version is available on NuGet, we should
            // be able to put this back

            // var typeName = typeof(TResource).Name;
            // IQueryable<TResource> query = container.GetItemLinqQueryable<TResource>().Where(x => x.Type == typeName);
            // if (filter != null)
            //     query = query.Where(filter);
                
            // var queryIterator = query.ToFeedIterator();

            var cosmosDbFilter = new CosmosDbFilter<TResource>(filter);

            var queryDefinition = cosmosDbFilter.ToQueryDefinition();

            var queryIterator = container.GetItemQueryIterator<CosmosDbItem<TResource, TPartitionKey>>(queryDefinition);

            while (queryIterator.HasMoreResults)
            {
                var resp = await queryIterator.ReadNextAsync();
                results.AddRange(resp.Resource.Select(r => r.Resource));
                continuationToken = resp.ContinuationToken;
            }

            if (continuationToken != null)
                await AddQueryResultsAsync(filter, results, continuationToken);
        }

        public async Task<IEnumerable<TResource>> QueryAsync(Expression<Func<TResource, bool>> filter = null)
        {
            var results = new List<TResource>();

            await AddQueryResultsAsync(filter, results);

            return results;
        }
        
        public async Task<TResource> GetAsync(string id, TPartitionKey partitionKey)
        {
            var container = await GetContainerAsync();

            var resp = await container.ReadItemStreamAsync(Uri.EscapeDataString(id), GetPartitionKey(partitionKey));

            if (resp.StatusCode == HttpStatusCode.NotFound)
                return default(TResource);

            resp.EnsureSuccessStatusCode();
            
            return await ToItemAsync(resp.Content);
        }

        public async Task<TResource> PutAsync(string id, TPartitionKey partitionKey, TResource resource)
        {
            if (resource.Id != id)
                resource.Id = id;
            
            var container = await GetContainerAsync();

            var item = new CosmosDbItem<TResource, TPartitionKey>(id, partitionKey, resource);

            var resp = await container.UpsertItemAsync(item, GetPartitionKey(partitionKey));

            return resp.Resource?.Resource;
        }

        public async Task DeleteAsync(string id, TPartitionKey partitionKey)
        {
            var container = await GetContainerAsync();

            await container.DeleteItemAsync<CosmosDbItem<TResource, TPartitionKey>>(Uri.EscapeDataString(id), GetPartitionKey(partitionKey));
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

        private async Task<TResource> ToItemAsync(Stream stream)
        {
            string bodyText;
            using (var streamReader = new StreamReader(stream))
                bodyText = await streamReader.ReadToEndAsync();

            return JToken.Parse(bodyText).ToMcmaObject<CosmosDbItem<TResource, TPartitionKey>>()?.Resource;
        }
    }
}
