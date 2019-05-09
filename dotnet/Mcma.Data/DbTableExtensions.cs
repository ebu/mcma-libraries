using System;
using System.Threading.Tasks;
using Mcma.Core;

namespace Mcma.Data
{
    public static class DbTableExtensions
    {
        public static async Task<T> GetAsync<T>(this IDbTable<T> table, string id, bool throwIfNotFound) where T : McmaResource
        {
            var resource = await table.GetAsync(id);
            if (resource == null && throwIfNotFound)
                throw new Exception($"Resource of type {typeof(T).Name} with id '{id}' was not found.");

            return resource;
        }

        public static async Task<T> UpdateJobStatus<T>(this IDbTable<T> table, string id, JobStatus status, string statusMessage = null) where T : JobBase
        {
            var jobBase = await table.GetAsync(id, true);
            jobBase.Status = status;
            jobBase.StatusMessage = statusMessage;
            await table.PutAsync(id, jobBase);
            return jobBase;
        }
    }
}
