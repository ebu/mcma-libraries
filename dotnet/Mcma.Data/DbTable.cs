using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Mcma.Core;

namespace Mcma.Data
{
    public abstract class DbTable<T> : IDbTable<T> where T : McmaResource
    {
        Task<IEnumerable<T>> IDbTable<T>.QueryAsync(Expression<Func<T, bool>> filter)
        {
            return QueryAsync(filter);
        }

        Task<T> IDbTable<T>.GetAsync(string id)
        {
            return GetAsync(id);
        }
        
        Task IDbTable<T>.PutAsync(string id, T resource)
        {
            resource.OnUpsert(id);

            return PutAsync(id, resource);
        }
        
        Task IDbTable<T>.DeleteAsync(string id)
        {
            return DeleteAsync(id);
        }

        protected abstract Task<IEnumerable<T>> QueryAsync(Expression<Func<T, bool>> filter);

        protected abstract Task<T> GetAsync(string id); 

        protected abstract Task<T> PutAsync(string id, T resource);

        protected abstract Task DeleteAsync(string id);

    }
}
