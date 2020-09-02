using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Mcma.Data;

namespace Mcma.Aws.DynamoDb
{
    public class DynamoDbTableProvider : IDocumentDatabaseTableProvider
    {
        public DynamoDbTableProvider(DynamoDbTableOptions options = null, IAmazonDynamoDB dynamoDb = null)
        {
            Options = options ?? new DynamoDbTableOptions();
            DynamoDb = dynamoDb ?? new AmazonDynamoDBClient();
        }
        
        private DynamoDbTableOptions Options { get; }
        
        private IAmazonDynamoDB DynamoDb { get; }

        public async Task<IDocumentDatabaseTable> GetAsync(string tableName)
            => new DynamoDbTable(DynamoDb, await DynamoDb.GetTableDescriptionAsync(tableName), Options);
    }
}