using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Mcma;
using Mcma.Data.DocumentDatabase.Queries;

namespace Mcma.Data
{
    public interface IDocumentDatabaseTable
    {
        Task<IEnumerable<T>> QueryAsync<T>(Query<T> query) where T : class;

        Task<T> GetAsync<T>(string id) where T : class;

        Task<T> PutAsync<T>(string id, T resource) where T : class;

        Task DeleteAsync(string id);

        IDocumentDatabaseMutex CreateMutex(string mutexName, string mutexHolder, TimeSpan? lockTimeout = null);
    }
}
