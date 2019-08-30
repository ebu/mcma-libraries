using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Mcma.Core;

namespace Mcma.Data
{
    public interface IDbTable<TResource, TPartitionKey> where TResource : McmaResource
    {
        Task<IEnumerable<TResource>> QueryAsync(Expression<Func<TResource, bool>> filter = null);

        Task<TResource> GetAsync(string id, TPartitionKey partitionKey);

        Task<TResource> PutAsync(string id, TPartitionKey partitionKey, TResource resource);

        Task DeleteAsync(string id, TPartitionKey partitionKey);
    }
}
