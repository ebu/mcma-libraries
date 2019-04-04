using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.Runtime;
using Newtonsoft.Json.Linq;
using Mcma.Core.Serialization;

namespace Mcma.Aws
{
    public class DynamoDbTable
    {
        public DynamoDbTable(string tableName)
        {
            Table = Table.LoadTable(new AmazonDynamoDBClient(), tableName);
        }

        private Table Table { get; }

        private T DocumentToResource<T>(Document document) where T : class
        {
            var docJson = JObject.Parse(document.ToJson());
            
            var resourceJson = docJson["resource"];

            return resourceJson != null ? resourceJson.ToMcmaObject<T>() : null;
        }

        private Document ResourceToDocument<T>(string id, T resource) where T : class
        {
            var jObj = new JObject
            {
                ["resource_type"] = typeof(T).Name,
                ["resource_id"] = id,
                ["resource"] = resource.ToMcmaJson()
            };

            RemoveEmptyStrings(jObj);

            return Document.FromJson(jObj.ToString());
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

        public async Task<IList<T>> GetAllAsync<T>() where T : class
        {
            var query = Table.Query(typeof(T).Name, new QueryFilter());

            var documents = await query.GetRemainingAsync();

            return documents.Select(DocumentToResource<T>).ToList();
        }

        public async Task<T> GetAsync<T>(string id) where T : class
        {
            var document = await Table.GetItemAsync(typeof(T).Name, id);

            return document != null ? DocumentToResource<T>(document) : null;
        }

        public async Task PutAsync<T>(string id, T resource) where T : class
        {
            await Table.PutItemAsync(ResourceToDocument(id, resource));
        }

        public async Task DeleteAsync<T>(string id) where T : class
        {
            await Table.DeleteItemAsync(typeof(T).Name, id);
        }
    }
}