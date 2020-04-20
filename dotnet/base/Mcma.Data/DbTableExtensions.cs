using System;
using System.Threading.Tasks;
using Mcma.Core;

namespace Mcma.Data
{
    public static class DbTableExtensions
    {
        public static async Task<T> GetAndThrowIfNotFoundAsync<T>(this IDbTable<T, Type> table, string id) where T : McmaResource
        {
            var resource = await table.GetAsync(id);
            if (resource == null)
                throw new Exception($"Resource of type {typeof(T).Name} with id '{id}' was not found.");

            return resource;
        }

        public static async Task<T> UpdateJobStatusAsync<T>(this IDbTable<T, Type> table, string id, JobStatus status, string statusMessage = null) where T : JobBase
        {
            var jobBase = await table.GetAndThrowIfNotFoundAsync(id);
            jobBase.Status = status;
            jobBase.StatusMessage = statusMessage;
            await table.PutAsync(id, jobBase);
            return jobBase;
        }

        public static Task<T> GetAsync<T>(this IDbTable<T, Type> dbTablePartitionedByType, string id) where T : McmaResource
            => dbTablePartitionedByType.GetAsync(id, typeof(T));

        public static Task<T> PutAsync<T>(this IDbTable<T, Type> dbTablePartitionedByType, string id, T resource) where T : McmaResource
            => dbTablePartitionedByType.PutAsync(id, typeof(T), resource);

        public static Task DeleteAsync<T>(this IDbTable<T, Type> dbTablePartitionedByType, string id) where T : McmaResource
            => dbTablePartitionedByType.DeleteAsync(id, typeof(T));

        public static Task DeleteAsync<T>(this IDbTable<T, Type> dbTablePartitionedByType, T resource) where T : McmaResource
            => dbTablePartitionedByType.DeleteAsync(resource.Id, typeof(T));
    }
}
