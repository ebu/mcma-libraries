using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Mcma.Core;
using Microsoft.Azure.Cosmos;

namespace Mcma.Azure.CosmosDb.FilterExpressions
{
    public class CosmosDbFilter<T> where T : McmaResource
    {
        public CosmosDbFilter(Expression<Func<T, bool>> filter)
        {
            Filter = filter;
        }

        private Expression<Func<T, bool>> Filter { get; }

        public QueryDefinition ToQueryDefinition()
        {
            var query = $"SELECT VALUE root FROM root WHERE (root[\"type\"] = '{typeof(T).Name}')";
            var parameters = new List<object>();

            if (Filter != null)
            {
                var visitor = new CosmosQueryFilterExpressionVisitor<T>();
                visitor.Visit(Filter);
                
                query += $" AND ({visitor.WhereClause})";
                parameters = visitor.Parameters;
            }
            
            return parameters
                .Select((p, i) => new { Name = $"@p{i}", Value = p })
                .Aggregate(
                    new QueryDefinition(query),
                    (agg, param) => agg.WithParameter(param.Name, param.Value));
        }
    }
}
