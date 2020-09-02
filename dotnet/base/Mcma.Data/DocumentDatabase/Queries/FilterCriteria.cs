using System;
using System.Linq.Expressions;
using System.Reflection;

namespace Mcma.Data.DocumentDatabase.Queries
{
    public class FilterCriteria<TDoc> : IFilterExpression<TDoc>
    {
        public FilterCriteria(string propertyName, BinaryOperator @operator, object propertyValue)
        {
            Property = typeof(TDoc).GetProperty(propertyName) ?? throw new McmaException($"Property '{propertyName}' does not exist on type {typeof(TDoc).Name}.");
            Operator = @operator;
            PropertyValue = propertyValue;
            
            if (!Property.PropertyType.IsAssignableFrom(propertyValue.GetType()))
                throw new McmaException($"Property {propertyName} on type {typeof(TDoc).Name} cannot be assigned a value of type {propertyValue?.GetType().Name ?? "(null)"}");
        }
        
        public PropertyInfo Property { get; }
        public BinaryOperator Operator { get; }
        public object PropertyValue { get; }
    }
    
    public class FilterCriteria<TDoc, TProp> : IFilterExpression<TDoc>
    {
        public FilterCriteria(Expression<Func<TDoc, TProp>> property, BinaryOperator @operator, TProp propertyValue)
        {
            Property = property;
            Operator = @operator;
            PropertyValue = propertyValue;
        }
        
        public Expression<Func<TDoc, TProp>> Property { get; }
        public BinaryOperator Operator { get; }
        public TProp PropertyValue { get; }
    }
}