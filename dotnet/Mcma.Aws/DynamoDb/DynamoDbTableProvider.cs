using Mcma.Data;
using Mcma.Core;
using Mcma.Api;

namespace Mcma.Aws.DynamoDb
{
    public class DynamoDbTableProvider<T> : IDbTableProvider<T> where T : McmaResource
    {
        public IDbTable<T> Table(string tableName) => new DynamoDbTable<T>(tableName);
    }
}