using System;
using System.Collections;
using System.Linq;
using Amazon.DynamoDBv2.DocumentModel;
using Mcma.Data.DocumentDatabase.Queries;
using Mcma.Serialization;

namespace Mcma.Aws.DynamoDb
{
    public static class DynamoDbFilterExpressionBuilder
    {
        public static Expression Build<T>(IFilterExpression<T> filterExpression)
        {
            if (filterExpression == null)
                return null;

            var expression = new Expression {ExpressionAttributeNames = {["#r"] = "resource"}};
            expression.ExpressionStatement = AddFilterExpression(expression, filterExpression);
            return expression;
        }

        private static string AddFilterExpression<T>(Expression expression, IFilterExpression<T> filterExpression)
            => filterExpression switch
            {
                FilterCriteriaGroup<T> filterCriteriaGroup => AddFilterCriteriaGroup(expression, filterCriteriaGroup),
                FilterCriteria<T> filterCriteria => AddFilterCriteria(expression, filterCriteria),
                _ => throw new McmaException($"Filter expression with type '{filterExpression.GetType().Name} is not supported.")
            };

        private static string AddFilterCriteriaGroup<T>(Expression expression, FilterCriteriaGroup<T> filterCriteriaGroup)
            =>
                "(" +
                string.Join($" {(filterCriteriaGroup.LogicalOperator == LogicalOperator.Or ? "or" : "and")} ",
                            filterCriteriaGroup.Children.Select(x => AddFilterExpression(expression, x))) +
                ")";

        private static string AddFilterCriteria<T>(Expression expression, FilterCriteria<T> filterCriteria)
        {
            string attributeNameKey;
            if (!expression.ExpressionAttributeNames.ContainsKey(filterCriteria.Property.Name))
            {
                attributeNameKey = $"#a{expression.ExpressionAttributeNames.Count}";
                expression.ExpressionAttributeNames[attributeNameKey] = filterCriteria.Property.Name;
            }
            else
                attributeNameKey = expression.ExpressionAttributeNames[filterCriteria.Property.Name];

            var attributeValueKey = $":a{expression.ExpressionAttributeValues.Count}";
            expression.ExpressionAttributeValues[attributeValueKey] = GetAttributeValue(filterCriteria.PropertyValue);

            return $"#r.{attributeNameKey} {filterCriteria.Operator} {attributeValueKey}";
        }

        private static DynamoDBEntry GetAttributeValue(object propertyValue)
        {
            if (propertyValue == null)
                return DynamoDBNull.Null;

            if (propertyValue.GetType().IsGenericType && propertyValue.GetType().GetGenericTypeDefinition() == typeof(Nullable<>))
                // ReSharper disable once PossibleNullReferenceException - We know the Value property exists on the Nullable type
                propertyValue = propertyValue.GetType().GetProperty(nameof(Nullable<int>.Value)).GetValue(propertyValue);
            
            return propertyValue switch
            {
                bool b => new DynamoDBBool(b),
                ushort ush => (Primitive)ush,
                short sh => (Primitive)sh,
                uint ui => (Primitive)ui,
                int i => (Primitive)i,
                ulong ul => (Primitive)ul,
                long l => (Primitive)l,
                float f => (Primitive)f,
                double d => (Primitive)d,
                string str => (Primitive)str,
                DateTimeOffset dto => (Primitive)dto.ToString("O"),
                DateTime dt => (Primitive)dt.ToString("O"),
                TimeSpan ts => (Primitive)ts.ToString(),
                IEnumerable enumerable => new DynamoDBList(enumerable.OfType<object>().Select(GetAttributeValue)),
                var x => Document.FromJson(x.ToMcmaJson().ToString())
            };
        }
    }
}
