using Mcma.Azure.CosmosDb.Json;
using Mcma.Core;
using Newtonsoft.Json;

namespace Mcma.Azure.CosmosDb
{
    public class CosmosDbItem<TResource, TPartitionKey> where TResource : McmaResource
    {
        public CosmosDbItem()
        {
        }

        public CosmosDbItem(string id, TPartitionKey partitionKey, TResource resource)
        {
            Id = id;
            Type = typeof(TResource).Name;
            PartitionKey = partitionKey;
            Resource = resource;
        }

        [JsonConverter(typeof(IdConverter))]
        public string Id { get; set; }

        public string Type { get; set; }

        [JsonConverter(typeof(PartitionKeyConverter))]
        public TPartitionKey PartitionKey { get; set; }

        public TResource Resource { get; set; }
    }
}
