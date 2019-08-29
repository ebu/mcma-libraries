using System;
using Mcma.Core;

namespace Mcma.Data
{
    public static class DbTableProviderExtensions
    {
        public static IDbTable<TResource, Type> Table<TResource>(this IDbTableProvider dbTableProvider, string tableName = null)
            where TResource : McmaResource
            => dbTableProvider.Table<TResource, Type>(tableName);
    }
}
