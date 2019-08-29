using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace Mcma.Api.QueryFilters
{
    public interface IQueryFilterExpressionProvider
    {
        /// <summary>
        /// Builds a filter from a collection of key-value pairs coming from the query string of a request
        /// </summary>
        /// <param name="queryParams"></param>
        /// <typeparam name="T"></typeparam>
        /// <returns></returns>
        Expression<Func<T, bool>> CreateFilterExpression<T>(IDictionary<string, string> queryParams);
    }
}
