using System;
using System.Linq;
using System.Linq.Expressions;
using Mcma.Core;
using Microsoft.Azure.Cosmos;

namespace Mcma.Azure.CosmosDb.FilterExpressions
{
    public class CosmosDbFilter<T> where T : McmaResource
    {
        public CosmosDbFilter(string tableName, Expression<Func<T, bool>> filter)
        {
            Filter = filter;
        }

        private string TableName { get; }

        private Expression<Func<T, bool>> Filter { get; }

        public QueryDefinition ToQueryDefinition()
        {
            var visitor = new CosmosQueryFilterExpressionVisitor<T>();
            visitor.Visit(Filter);
            
            return visitor.Parameters
                .Select((p, i) => new { Name = $"@p{i}", Value = p })
                .Aggregate(
                    new QueryDefinition($"SELECT * FROM [{TableName}] WHERE {visitor.WhereClause}"),
                    (agg, param) => agg.WithParameter(param.Name, param.Value));
        }
    }
}
