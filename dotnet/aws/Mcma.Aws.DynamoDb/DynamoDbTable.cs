using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DocumentModel;
using Mcma.Data;
using Mcma.Data.DocumentDatabase.Queries;
using Mcma.Serialization;
using Newtonsoft.Json.Linq;

namespace Mcma.Aws.DynamoDb
{
    public class DynamoDbTable : IDocumentDatabaseTable
    {
        public DynamoDbTable(IAmazonDynamoDB dynamoDb, DynamoDbTableDescription tableDescription, DynamoDbTableOptions options = null)
        {
            TableDescription = tableDescription ?? throw new ArgumentNullException(nameof(tableDescription));
            Options = options ?? new DynamoDbTableOptions();
            Table = dynamoDb != null ? Table.LoadTable(dynamoDb, tableDescription.TableName) : throw new ArgumentNullException(nameof(dynamoDb));
        }

        private DynamoDbTableDescription TableDescription { get; }

        private DynamoDbTableOptions Options { get; }

        private Table Table { get; }

        private static (string partitionKey, string sortKey) ParsePartitionAndSortKeys(string id)
        {
            var lastSlashIndex = id.LastIndexOf('/');
            return lastSlashIndex > 0
                       ? (id.Substring(0, lastSlashIndex), id.Substring(lastSlashIndex + 1))
                       : (id, id);
        }

        private static T DocumentToResource<T>(Document document) where T : class
        {
            var docJson = JObject.Parse(document.ToJson());

            var resourceJson = docJson["resource"];

            return resourceJson?.ToMcmaObject<T>();
        }

        private Document ResourceToDocument<T>(string partitionKey, string sortKey, T resource)
        {
            var resourceJson = resource.ToMcmaJson().RemoveEmptyStrings();
            
            var item = new JObject
            {
                [TableDescription.PartitionKeyName] = partitionKey,
                [TableDescription.SortKeyName] = sortKey,
                [nameof(resource)] = resourceJson
            };

            foreach (var kvp in Options.TopLevelAttributeMappings)
                item[kvp.Key] = resourceJson.SelectToken(kvp.Value);

            return Document.FromJson(item.ToString());
        }

        private static async Task<IEnumerable<T>> ExecuteScanOrQueryAsync<T>(Func<Search> executeQueryOrScan, int? pageSize, int? pageNumber) where T : class
        {
            var items = new List<T>();
            var itemsReturned = 0;
            
            var search = executeQueryOrScan();
            do
            {
                var data = await search.GetNextSetAsync();

                var itemsToAdd = new List<Document>();
                if (!pageSize.HasValue)
                {
                    itemsToAdd.AddRange(data);
                }
                else
                {
                    var startIndex = pageSize.Value * pageNumber.GetValueOrDefault();
                    var endIndex = startIndex + pageSize.Value;

                    for (var i = 0; i < data.Count; i++)
                    {
                        var currentOverallIndex = itemsReturned + i;
                        if (currentOverallIndex < startIndex || currentOverallIndex >= endIndex)
                            continue;
                        
                        itemsToAdd.Add(data[i]);

                        if (items.Count + itemsToAdd.Count == pageSize.Value)
                            break;
                    }

                    items.AddRange(itemsToAdd.Select(DocumentToResource<T>));

                    itemsReturned += data.Count;
                }
            }
            while (!search.IsDone && (!pageSize.HasValue || items.Count < pageSize));

            return items;
        }

        private async Task<IEnumerable<T>> ExecuteQueryAsync<T>(Query<T> query) where T : class
        {
            var queryOpConfig = new QueryOperationConfig
            {
                KeyExpression = new Expression
                {
                    ExpressionStatement = "#partitionKey = :partitionKey",
                    ExpressionAttributeNames = new Dictionary<string, string> {["#partitionKey"] = TableDescription.PartitionKeyName},
                    ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry> {[":partitionKey"] = query.Path}
                },
                FilterExpression = DynamoDbFilterExpressionBuilder.Build(query.FilterExpression),
                ConsistentRead = Options.ConsistentQuery ?? false
            };

            if (!string.IsNullOrWhiteSpace(query.SortBy))
            {
                queryOpConfig.IndexName = GetIndexName(query.SortBy);
                queryOpConfig.BackwardSearch = !query.SortAscending;
            }

            return await ExecuteScanOrQueryAsync<T>(() => Table.Query(queryOpConfig),
                                                    query.PageSize,
                                                    query.PageNumber);
        }

        private async Task<IEnumerable<T>> ExecuteScanAsync<T>(Query<T> query) where T : class
        {
            var scanOpConfig = new ScanOperationConfig
            {
                FilterExpression = DynamoDbFilterExpressionBuilder.Build(query.FilterExpression),
                ConsistentRead = Options.ConsistentQuery ?? false
            };

            if (!string.IsNullOrWhiteSpace(query.SortBy))
            {
                if (!query.SortAscending)
                    throw new McmaException("Scan does not support descending sorts.");
                scanOpConfig.IndexName = GetIndexName(query.SortBy);
            }

            return await ExecuteScanOrQueryAsync<T>(() => Table.Scan(scanOpConfig),
                                                    query.PageSize,
                                                    query.PageNumber);
        }

        private string GetIndexName(string sortBy)
        {
            var indexName = Options != null && Options.IndexNameMappings.ContainsKey(sortBy) ? Options.IndexNameMappings[sortBy] : sortBy;
            
            if (!TableDescription.IndexNames.Contains(indexName))
                throw new McmaException($"Invalid sortBy '{sortBy}'. A matching index was not found for the table.");
            
            return indexName;
        }

        public async Task<IEnumerable<T>> QueryAsync<T>(Query<T> query) where T : class
        {
            return await ExecuteQueryAsync(query);
        }

        public async Task<T> GetAsync<T>(string id) where T : class
        {
            var (partitionKey, sortKey) = ParsePartitionAndSortKeys(id);

            var document = await Table.GetItemAsync(partitionKey,
                                                    sortKey,
                                                    new GetItemOperationConfig {ConsistentRead = Options.ConsistentGet ?? false});

            return document != null ? DocumentToResource<T>(document) : null;
        }

        public async Task<T> PutAsync<T>(string id, T resource) where T : class
        {
            var (partitionKey, sortKey) = ParsePartitionAndSortKeys(id);
            await Table.PutItemAsync(ResourceToDocument(partitionKey, sortKey, resource));
            return resource;
        }

        public async Task DeleteAsync(string id)
        {
            var (partitionKey, sortKey) = ParsePartitionAndSortKeys(id);
            await Table.DeleteItemAsync(partitionKey, sortKey);
        }

        public IDocumentDatabaseMutex CreateMutex(string mutexName, string mutexHolder, TimeSpan? lockTimeout)
            => new DynamoDbMutex(Table, TableDescription, mutexName, mutexHolder, lockTimeout);
    }
}