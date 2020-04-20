using Mcma.Data;
using Mcma.Core;

namespace Mcma.Aws.DynamoDb
{
    public class DynamoDbTableProvider : IDbTableProvider
    {
        public IDbTable<TResource, TPartitionKey> Get<TResource, TPartitionKey>(string tableName = null)
            where TResource : McmaResource
            => new DynamoDbTable<TResource,  TPartitionKey>(tableName ?? typeof(TResource).Name);
    }
}