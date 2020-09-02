using System;
using System.Net;
using System.Threading.Tasks;
using Mcma.Data;
using Mcma.Logging;
using Microsoft.Azure.Cosmos;
using Newtonsoft.Json.Linq;

namespace Mcma.Azure.CosmosDb
{
    public class CosmosDbMutex : DocumentDatabaseMutex
    {
        public CosmosDbMutex(Container container, string partitionKeyName, string mutexName, string mutexHolder, TimeSpan? lockTimeout, ILogger logger = null)
            : base(mutexName, mutexHolder, lockTimeout, logger)
        {
            Container = container;
            PartitionKeyName = partitionKeyName;
        }
        
        private Container Container { get; }

        private string PartitionKeyName { get; }

        private string ETag { get; set; }

        protected override string VersionId => ETag;

        protected override async Task PutLockDataAsync()
        {
            var item = JObject.FromObject(new
            {
                Id = Uri.EscapeDataString($"Mutex-{MutexName}"),
                MutexHolder,
                Timestamp = DateTime.UtcNow
            });

            var partitionKey =
                !string.IsNullOrWhiteSpace(PartitionKeyName) ? new PartitionKey("Mutex") : PartitionKey.None;
            
            var response = await Container.CreateItemAsync(item, partitionKey);
        
            ETag = response.ETag;
        }

        protected override async Task<LockData> GetLockDataAsync()
        {
            var id = Uri.EscapeDataString($"Mutex-{MutexName}");
            var partitionKey = !string.IsNullOrWhiteSpace(PartitionKeyName) ? new PartitionKey("Mutex") : PartitionKey.None;

            var itemResponse =
                await Container.ReadItemAsync<LockData>(id, partitionKey, new ItemRequestOptions {ConsistencyLevel = ConsistencyLevel.Strong});
            if (itemResponse.StatusCode == HttpStatusCode.NotFound || itemResponse.Resource == null)
                return null;

            // sanity check which removes the record from CosmosDB in case it has incompatible structure. Only possible
            // if modified externally, but this could lead to a situation where the lock would never be acquired.
            if (itemResponse.Resource != null &&
                (itemResponse.Resource.MutexHolder == null || itemResponse.Resource.Timestamp == default))
            {
                await Container.DeleteItemAsync<LockData>(id, partitionKey);
                return null;
            }

            itemResponse.Resource.VersionId = itemResponse.ETag;
        
            return itemResponse.Resource;
        }

        protected override async Task DeleteLockDataAsync(string versionId)
        {
            var id = Uri.EscapeDataString($"Mutex-{MutexName}");
            var partitionKey = !string.IsNullOrWhiteSpace(PartitionKeyName) ? new PartitionKey("Mutex") : PartitionKey.None;

            await Container.DeleteItemAsync<LockData>(id, partitionKey, new ItemRequestOptions {IfMatchEtag = versionId});
        }
    }
}