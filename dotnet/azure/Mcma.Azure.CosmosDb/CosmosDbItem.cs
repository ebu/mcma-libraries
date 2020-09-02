using System.Linq;
using Newtonsoft.Json;

namespace Mcma.Azure.CosmosDb
{
    public class CosmosDbItem<T> where T : class
    {
        public CosmosDbItem()
        {
        }

        public CosmosDbItem(string id, T resource)
        {
            var idParts = id.Split('/');

            Id = id;
            PartitionKey = string.Join("/", idParts.Take(idParts.Length - 1));
            Resource = resource;
        }

        [JsonConverter(typeof(IdConverter))]
        public string Id { get; set; }
        
        public string PartitionKey { get; set; }

        public T Resource { get; set; }
    }
}
