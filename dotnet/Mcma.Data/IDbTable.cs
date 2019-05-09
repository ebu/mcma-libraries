using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Mcma.Core;

namespace Mcma.Data
{
    public interface IDbTable<T> where T : McmaResource
    {
        Task<IEnumerable<T>> QueryAsync(Expression<Func<T, bool>> filter);

        Task<T> GetAsync(string id);

        Task PutAsync(string id, T resource);

        Task DeleteAsync(string id);
    }
}
