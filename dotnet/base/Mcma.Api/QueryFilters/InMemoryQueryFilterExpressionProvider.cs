using System;
using System.Linq;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;

namespace Mcma.Api.QueryFilters
{
    public class InMemoryQueryFilterExpressionProvider : IQueryFilterExpressionProvider
    {
        private class PropertyFilter<T>
        {
            public PropertyFilter(string propertyName, string textValue)
            {
                Property = typeof(T).GetProperties().FirstOrDefault(p => p.Name.Equals(propertyName, StringComparison.OrdinalIgnoreCase));
                TextValue = textValue;
            }

            public PropertyInfo Property { get; }

            public string TextValue { get; }

            public bool IsMatch(T resource) => Property.GetValue(resource)?.ToString() == TextValue;
        }

        public Expression<Func<T, bool>> CreateFilterExpression<T>(IDictionary<string, string> queryParams)
        {
            // if we don't have filters to apply, leave the collection as-is
            if (queryParams == null || !queryParams.Any())
                return null;
                
            // convert dictionary of property names to dictionary of PropertyInfos
            var propertyValues =
                queryParams
                    .Select(kvp => new PropertyFilter<T>(kvp.Key, kvp.Value))
                    .Where(x => x.Property != null)
                    .ToList();

            return item => propertyValues.All(x => x.IsMatch(item));
        }
    }
}
