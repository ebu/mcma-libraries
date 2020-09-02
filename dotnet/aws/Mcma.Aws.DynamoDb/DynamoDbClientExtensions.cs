using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;

namespace Mcma.Aws.DynamoDb
{
    public static class DynamoDbClientExtensions
    {
        private static Dictionary<string, DynamoDbTableDescription> TableDescriptions { get; } =
            new Dictionary<string, DynamoDbTableDescription>(StringComparer.OrdinalIgnoreCase);

        private static SemaphoreSlim TableDescriptionsSemaphore { get; } = new SemaphoreSlim(1, 1);

        public static async Task<DynamoDbTableDescription> GetTableDescriptionAsync(this IAmazonDynamoDB dynamoDb, string tableName)
        {
            await TableDescriptionsSemaphore.WaitAsync();

            DynamoDbTableDescription tableDescription;
            try
            {
                if (!TableDescriptions.ContainsKey(tableName))
                {
                    var data = await dynamoDb.DescribeTableAsync(tableName);

                    string partitionKeyName = null;
                    string sortKeyName = null;
                    foreach (var key in data.Table.KeySchema)
                    {
                        if (key.KeyType == KeyType.HASH)
                            partitionKeyName = key.AttributeName;
                        else if (key.KeyType == KeyType.RANGE)
                            sortKeyName = key.AttributeName;
                    }

                    var indexNames =
                        data.Table.GlobalSecondaryIndexes
                            .Select(gsi => gsi.IndexName)
                            .Concat(data.Table.LocalSecondaryIndexes.Select(lsi => lsi.IndexName)).ToArray();
                    
                    tableDescription = new DynamoDbTableDescription(tableName, partitionKeyName, sortKeyName, indexNames);

                    TableDescriptions[tableName] = tableDescription;
                }
                else
                    tableDescription = TableDescriptions[tableName];
            }
            finally
            {
                TableDescriptionsSemaphore.Release();
            }

            return tableDescription;
        }
    }
}