using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DocumentModel;
using Newtonsoft.Json.Linq;
using Mcma.Core.Serialization;
using Mcma.Data;
using Mcma.Core;
using System.Linq.Expressions;
using System;

namespace Mcma.Aws.DynamoDb
{
    public class DynamoDbTable<TResource, TPartitionKey> : IDbTable<TResource, TPartitionKey> where TResource : McmaResource
    {
        public DynamoDbTable(string tableName)
        {
            Table = Table.LoadTable(new AmazonDynamoDBClient(), tableName);
        }

        private Table Table { get; }

        private TResource DocumentToResource(Document document)
        {
            var docJson = JObject.Parse(document.ToJson());
            
            var resourceJson = docJson["resource"];

            return resourceJson != null ? resourceJson.ToMcmaObject<TResource>() : null;
        }

        private Document ResourceToDocument(string id, TPartitionKey partitionKey, TResource resource)
        {
            var jObj = new JObject
            {
                ["resource_type"] = JToken.FromObject(partitionKey),
                ["resource_id"] = id,
                ["resource"] = resource.ToMcmaJson()
            };

            RemoveEmptyStrings(jObj);

            return Document.FromJson(jObj.ToString());
        }

        private Primitive GetRangeKey(TPartitionKey partitionKey)
        {
            if (partitionKey == null)
                return new Primitive();

            var primitive = new Primitive(partitionKey.ToString());

            switch (partitionKey)
            {
                case float partitionKeyFloat:
                case double partitionKeyDouble:
                case decimal partitionKeyDecimal:
                case int partitionKeyInt:
                case uint partitionKeyUInt:
                case long partitionKeyLong:
                case ulong partitionKeyULong:
                case short partitionKeyShort:
                case ushort partitionKeyUShort:
                    primitive.Type = DynamoDBEntryType.Numeric;
                    break;

                case string partitionKeyStr:
                case DateTime dateTime:
                case Guid guid:
                    primitive.Type = DynamoDBEntryType.String;
                    break;
            }

            return primitive;
        }

        private void RemoveEmptyStrings(JToken jToken)
        {
            if (jToken != null)
            {
                if (jToken.Type == JTokenType.Array)
                {
                    var array = (JArray)jToken;
                    for (var i = array.Count; i >= 0; i--)
                    {
                        if (array[i].Type == JTokenType.String && array[i].ToString() == string.Empty)
                            array.RemoveAt(i);
                        else if (array[i].Type == JTokenType.Object)
                            RemoveEmptyStrings(array[i]);
                    }
                }
                else if (jToken.Type == JTokenType.Object)
                {
                    var obj = (JObject)jToken;
                    foreach (var prop in obj.Properties().ToList())
                    {
                        if (prop.Value.Type == JTokenType.String && prop.Value.ToString() == string.Empty)
                            obj.Remove(prop.Name);
                        else if (prop.Value.Type == JTokenType.Object)
                            RemoveEmptyStrings(prop.Value);
                    }
                }
            }
        }

        public async Task<IEnumerable<TResource>> QueryAsync(Expression<Func<TResource, bool>> filter = null)
        {
            var query = Table.Query(typeof(TResource).Name, new QueryFilter());

            var documents = await query.GetRemainingAsync();

            var results = documents.Select(DocumentToResource);
            
            if (filter != null)
                results = results.Where(filter.Compile());
                
            return results.ToList();
        }

        public async Task<TResource> GetAsync(string id, TPartitionKey partitionKey)
        {
            var document = await Table.GetItemAsync(GetRangeKey(partitionKey), id);

            return document != null ? DocumentToResource(document) : null;
        }

        public async Task<TResource> PutAsync(string id, TPartitionKey partitionKey, TResource resource)
        {
            await Table.PutItemAsync(ResourceToDocument(id, partitionKey, resource));
            return resource;
        }

        public async Task DeleteAsync(string id, TPartitionKey partitionKey)
        {
            await Table.DeleteItemAsync(GetRangeKey(partitionKey), id);
        }
    }
}