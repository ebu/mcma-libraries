using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.Runtime;
using Newtonsoft.Json.Linq;
using Mcma.Core.Serialization;
using Mcma.Data;
using Mcma.Core;
using System.Linq.Expressions;
using System;

namespace Mcma.Aws.DynamoDb
{

    public class DynamoDbTable<T> : IDbTable<T> where T : McmaResource
    {
        public DynamoDbTable(string tableName)
        {
            Table = Table.LoadTable(new AmazonDynamoDBClient(), tableName);
        }

        private Table Table { get; }

        private T DocumentToResource(Document document)
        {
            var docJson = JObject.Parse(document.ToJson());
            
            var resourceJson = docJson["resource"];

            return resourceJson != null ? resourceJson.ToMcmaObject<T>() : null;
        }

        private Document ResourceToDocument(string id, T resource)
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

        public async Task<IEnumerable<T>> QueryAsync(Expression<Func<T, bool>> filter)
        {
            var query = Table.Query(typeof(T).Name, new QueryFilter());

            var documents = await query.GetRemainingAsync();

            return documents.Select(DocumentToResource).Where(filter != null ? filter.Compile() : x => true).ToList();
        }

        public async Task<T> GetAsync(string id)
        {
            var document = await Table.GetItemAsync(typeof(T).Name, id);

            return document != null ? DocumentToResource(document) : null;
        }

        public async Task PutAsync(string id, T resource)
        {
            await Table.PutItemAsync(ResourceToDocument(id, resource));
        }

        public async Task DeleteAsync(string id)
        {
            await Table.DeleteItemAsync(typeof(T).Name, id);
        }
    }
}