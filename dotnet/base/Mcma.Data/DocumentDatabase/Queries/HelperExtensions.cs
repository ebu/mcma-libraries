using System.Collections.Generic;
using System.Linq;

namespace Mcma.Data.DocumentDatabase.Queries
{
    public static class HelperExtensions
    {
        public static IFilterExpression<T> ToFilterExpression<T>(this IEnumerable<KeyValuePair<string, object>> keyValuePairs)
        {
            return new FilterCriteriaGroup<T>
            {
                Children = keyValuePairs.Select(kvp => new FilterCriteria<T>(kvp.Key, BinaryOperator.EqualTo, kvp.Value))
                                        .ToArray<IFilterExpression<T>>(),
                LogicalOperator = LogicalOperator.And
            };
        }
    }
}