using Mcma.Core;

namespace Mcma.Data
{
    public interface IDbTableProvider
    {
        IDbTable<TResource, TPartitionKey> Get<TResource, TPartitionKey>(string tableName = null)
            where TResource : McmaResource;
    }
}
