using System;
using System.Linq.Expressions;
using Mcma.Core;
using ScanExpression = Amazon.DynamoDBv2.DocumentModel.Expression;

namespace Mcma.Aws.DynamoDb.FilterExpressions
{
    public class DynamoDbFilter<T> where T : McmaResource
    {
        public DynamoDbFilter(Expression<Func<T, bool>> filter)
        {
            Filter = filter;
        }

        private Expression<Func<T, bool>> Filter { get; }

        public ScanExpression ToScanExpression()
        {
            var scanExpression =
                new ScanExpression
                {
                    ExpressionStatement = "#type = :type",
                    ExpressionAttributeNames = { ["#type"] = "@type" },
                    ExpressionAttributeValues = { [":type"] = typeof(T).Name }
                };

            if (Filter != null)
            {
                var visitor = new DynamoDbQueryFilterExpressionVisitor<T>();
                visitor.Visit(Filter);

                scanExpression.ExpressionStatement += $" AND ({visitor.ScanExpressionText})";
                
                for (var i = 0; i < visitor.AttributeNames.Count; i++)
                    scanExpression.ExpressionAttributeNames.Add($"#a{i}", visitor.AttributeNames[i]);
                    
                for (var i = 0; i < visitor.AttributeValues.Count; i++)
                    scanExpression.ExpressionAttributeValues.Add($":v{i}", visitor.AttributeValues[i].ToPrimitive());
            }

            return scanExpression;
        }
    }
}
