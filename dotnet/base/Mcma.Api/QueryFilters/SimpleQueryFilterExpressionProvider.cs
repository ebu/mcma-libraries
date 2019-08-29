using System;
using System.Linq;
using System.Collections.Generic;
using System.Linq.Expressions;
using Mcma.Core.Utility;

namespace Mcma.Api.QueryFilters
{
    public class SimpleQueryFilterExpressionProvider : IQueryFilterExpressionProvider
    {
        public Expression<Func<T, bool>> CreateFilterExpression<T>(IDictionary<string, string> queryParams)
        {
            var resourceProps = typeof(T).GetProperties();
            var parameter = Expression.Parameter(typeof(T), "resource");
            
            Expression clause = Expression.Constant(true);

            foreach (var keyValuePair in queryParams)
            {
                var curProp = resourceProps.FirstOrDefault(p => p.Name.Equals(keyValuePair.Key, StringComparison.OrdinalIgnoreCase));
                if (curProp == null)
                    continue;
                
                if (!keyValuePair.Value.TryParse(curProp.PropertyType, out var value))
                    throw new Exception($"Query parameter contains value '{keyValuePair.Value}' for property '{curProp.Name}', which cannot be parsed to the property's type of '{curProp.PropertyType.Name}'");

                var propAccess = Expression.MakeMemberAccess(parameter, curProp);
                var valueConst = Expression.Constant(value);
                var equalityComparison = Expression.Equal(propAccess, valueConst);

                if (clause == null)
                    clause = equalityComparison;
                else
                    clause = Expression.AndAlso(clause, equalityComparison);
            }

            return Expression.Lambda<Func<T, bool>>(clause, parameter);
        }
    }
}
