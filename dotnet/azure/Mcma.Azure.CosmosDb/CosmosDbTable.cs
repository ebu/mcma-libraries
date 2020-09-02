using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Mcma.Serialization;
using Mcma.Data;
using Mcma.Data.DocumentDatabase.Queries;
using Microsoft.Azure.Cosmos;
using Newtonsoft.Json.Linq;

namespace Mcma.Azure.CosmosDb
{
    public class CosmosDbTable : IDocumentDatabaseTable
    {
        public CosmosDbTable(Container container, ContainerProperties containerProperties)
        {
            Container = container;
            ContainerProperties = containerProperties;
            
            if (containerProperties.PartitionKeyPath.Split('/').Length > 1)
                throw new McmaException($"Container {containerProperties.Id} defines a partition key with multiple paths. MCMA only supports partition keys with a single path.");
        }
        
        private Container Container { get; }

        private ContainerProperties ContainerProperties { get; }

        private static PartitionKey ParsePartitionKey(string id)
        {
            var lastSlashIndex = id.LastIndexOf('/');
            return lastSlashIndex > 0 ? new PartitionKey(id.Substring(0, lastSlashIndex)) : PartitionKey.None;
        }
        
        private async Task AddQueryResultsAsync<T>(QueryDefinition queryDefinition, List<T> results) where T : class
        {
            var continuationToken = default(string);
            do
            {
                var queryIterator = Container.GetItemQueryIterator<CosmosDbItem<T>>(queryDefinition);
                while (queryIterator.HasMoreResults)
                {
                    var resp = await queryIterator.ReadNextAsync();
                    results.AddRange(resp.Resource.Select(r => r.Resource));
                    continuationToken = resp.ContinuationToken;
                }
            }
            while (continuationToken != null);
        }

        public async Task<IEnumerable<T>> QueryAsync<T>(Query<T> query) where T : class
        {
            var results = new List<T>();
            
            var queryDefinition = CosmosDbQueryDefinitionBuilder.Build(query, ContainerProperties.PartitionKeyPath);

            await AddQueryResultsAsync(queryDefinition, results);

            return results;
        }
        
        public async Task<T> GetAsync<T>(string id) where T : class
        {
            var resp = await Container.ReadItemStreamAsync(Uri.EscapeDataString(id), ParsePartitionKey(id));

            if (resp.StatusCode == HttpStatusCode.NotFound)
                return default;

            resp.EnsureSuccessStatusCode();
            
            return await ToItemAsync<T>(resp.Content);
        }

        public async Task<T> PutAsync<T>(string id, T resource) where T : class
        {
            var item = new CosmosDbItem<T>(id, resource);

            var resp = await Container.UpsertItemAsync(item, ParsePartitionKey(id));

            return resp.Resource?.Resource;
        }

        public async Task DeleteAsync(string id)
        {
            var resp = await Container.DeleteItemStreamAsync(Uri.EscapeDataString(id), ParsePartitionKey(id));
            resp.EnsureSuccessStatusCode();
        }

        public IDocumentDatabaseMutex CreateMutex(string mutexName, string mutexHolder, TimeSpan? lockTimeout = null)
            => new CosmosDbMutex(Container, ContainerProperties.PartitionKeyPath.Split('/').First(), mutexName, mutexHolder, lockTimeout);
        
        private static async Task<T> ToItemAsync<T>(Stream stream) where T : class
        {
            string bodyText;
            using (var streamReader = new StreamReader(stream))
                bodyText = await streamReader.ReadToEndAsync();

            return JToken.Parse(bodyText).ToMcmaObject<CosmosDbItem<T>>()?.Resource;
        }
    }
}
