using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Runtime.CompilerServices;
using Mcma.Core;

namespace Mcma.Azure.CosmosDb.FilterExpressions
{
    public class CosmosQueryFilterExpressionVisitor<T> where T : McmaResource
    {
        private static readonly MethodInfo StringContainsMethod =
            typeof(string)
                .GetMethods(BindingFlags.Instance | BindingFlags.Public)
                .FirstOrDefault(x =>
                    x.Name == nameof(string.Contains) &&
                    x.GetParameters().Length == 1 &&
                    x.GetParameters().First().ParameterType == typeof(string));

        private static readonly MethodInfo StringStartsWithMethod =
            typeof(string)
                .GetMethods(BindingFlags.Instance | BindingFlags.Public)
                .FirstOrDefault(x =>
                    x.Name == nameof(string.StartsWith) &&
                    x.GetParameters().Length == 1 &&
                    x.GetParameters().First().ParameterType == typeof(string));

        private static readonly MethodInfo StringEndsWithMethod =
            typeof(string)
                .GetMethods(BindingFlags.Instance | BindingFlags.Public)
                .FirstOrDefault(x =>
                    x.Name == nameof(string.EndsWith) &&
                    x.GetParameters().Length == 1 &&
                    x.GetParameters().First().ParameterType == typeof(string));

        public string WhereClause { get; private set; } = string.Empty;

        public List<string> Parameters { get; } = new List<string>();

        public void Visit(Expression<Func<T, bool>> filter) => Visit(filter.Body);

        public void Visit(Expression node)
        {
            switch (node)
            {
                case UnaryExpression unaryExp:
                    VisitUnary(unaryExp);
                    break;
                case BinaryExpression binaryExp:
                    VisitBinary(binaryExp);
                    break;
                case ConstantExpression constantExp:
                    VisitConstant(constantExp);
                    break;
                case MemberExpression memberExp:
                    VisitMember(memberExp);
                    break;
                case MethodCallExpression methodCallExp:
                    VisitMethodCall(methodCallExp);
                    break;
                default:
                    throw new NotSupportedException($"Expression '{node}' has unsupported expression type '{node.NodeType}'");
            }
        }

        private void VisitUnary(UnaryExpression node)
        {
            if (node.NodeType != ExpressionType.Not)
                throw new NotSupportedException($"Invalid filter expression. Expression '{node}' has node type '{node.NodeType}', which is not currently supported.");

            if (node.Operand.Type != typeof(bool))
                throw new NotSupportedException($"Invalid filter expression. Expression '{node}' uses the ! operator on an operand that is not a boolean.");
            
            WhereClause += "NOT(";
            Visit(node.Operand);
            WhereClause += ")";
        }

        private void VisitBinary(BinaryExpression node)
        {
            var isLogical = node.NodeType == ExpressionType.AndAlso || node.NodeType == ExpressionType.OrElse;

            WhereClause += "(";
            Visit(node.Left);
            if (isLogical && node.Left is MemberExpression leftMember && leftMember.Type == typeof(bool) && leftMember.Member is PropertyInfo)
                WhereClause += " = 1";
            WhereClause += " ";

            switch (node.NodeType)
            {
                case ExpressionType.AndAlso:
                    WhereClause += "AND";
                    break;
                case ExpressionType.OrElse:
                    WhereClause += "OR";
                    break;
                case ExpressionType.Add:
                    WhereClause += "+";
                    break;
                case ExpressionType.Subtract:
                    WhereClause += "-";
                    break;
                case ExpressionType.Multiply:
                    WhereClause += "*";
                    break;
                case ExpressionType.Divide:
                    WhereClause += "-";
                    break;
                case ExpressionType.Equal:
                    WhereClause += node.Right.ToString().Equals("null", StringComparison.OrdinalIgnoreCase) ?  "IS" : "=";
                    break;
                case ExpressionType.NotEqual:
                    WhereClause += node.Right.ToString().Equals("null", StringComparison.OrdinalIgnoreCase) ?  "IS NOT" : "!=";
                    break;
                case ExpressionType.GreaterThan:
                    WhereClause += ">";
                    break;
                case ExpressionType.GreaterThanOrEqual:
                    WhereClause += ">=";
                    break;
                case ExpressionType.LessThan:
                    WhereClause += "<";
                    break;
                case ExpressionType.LessThanOrEqual:
                    WhereClause += "<=";
                    break;
            }

            WhereClause += " ";
            Visit(node.Right);
            if (isLogical && node.Right is MemberExpression rightMember && rightMember.Type == typeof(bool) && rightMember.Member is PropertyInfo)
                WhereClause += " = 1";
            WhereClause += ")";
        }

        private void VisitMember(MemberExpression node)
        {
            if (node.Member.DeclaringType == typeof(DateTime) && node.Member.Name == nameof(DateTime.Now))
                WhereClause += "GETDATE()";
            else if (node.Member.DeclaringType == typeof(DateTime) && node.Member.Name == nameof(DateTime.UtcNow))
                WhereClause += "GETUTCDATE()";
            else if (node.Member is PropertyInfo)
                WhereClause += "[" + node.Member.Name + "]";
            else if (node.Member is FieldInfo)
            {
                var value = GetValue(node);
                Parameters.Add(GetSqlTextValue(value));
                WhereClause += $"@p{Parameters.Count - 1}";
            }
        }

        private void VisitMethodCall(MethodCallExpression node)
        {
            if (node.Method == StringContainsMethod || node.Method == StringStartsWithMethod || node.Method == StringEndsWithMethod)
            {
                if (!(node.Object is MemberExpression propertyMember))
                    throw new Exception($"Invalid expression. Cannot use string.{node.Method.Name} to check a value that is not a member of the type being queried.");

                var likeParam = 
                    (node.Method == StringContainsMethod || node.Method == StringEndsWithMethod ?  "%" : string.Empty) +
                    GetValue(node.Arguments[0]).ToString() +
                    (node.Method == StringContainsMethod || node.Method == StringStartsWithMethod ? "%" : string.Empty);

                Parameters.Add(likeParam);

                WhereClause += "[" + propertyMember.Member.Name + "] LIKE @p" + (Parameters.Count - 1);
            }
            else if (node.Method.Name == "Contains")
            {
                var itemType = node.Method.GetGenericArguments().First();

                Expression valueList;
                Expression property;
                if (node.Method.GetCustomAttribute<ExtensionAttribute>() != null)
                {
                    valueList = node.Arguments[0];
                    property = node.Arguments[1];
                }
                else
                {
                    valueList = node.Object;
                    property = node.Arguments[0];
                }

                if (!(property is MemberExpression propertyMember))
                    throw new Exception($"Invalid expression. Cannot use Contains to check for a value that is not a member of the type being queried.");

                var values = (IEnumerable)GetValue(valueList);
                var startIndex = Parameters.Count;

                foreach (var value in values)
                    Parameters.Add(GetSqlTextValue(value));
                
                WhereClause += "[" + propertyMember.Member.Name + "] IN (";
                WhereClause += string.Join(",", Enumerable.Range(startIndex, Parameters.Count - startIndex).Select(i => $"@p{i}"));
                WhereClause += ")";
            }
            else
                throw new NotSupportedException(
                    $"Invalid expression. Expression {node} contains call to unsupported method method {node.Method.DeclaringType.Name}.{node.Method.Name}");
        }

        private void VisitConstant(ConstantExpression node)
        {
            Parameters.Add(GetSqlTextValue(node.Value));
            WhereClause += $"@p{Parameters.Count - 1}";
        }

        private string GetSqlTextValue(object value)
        {
            switch (value)
            {
                case DateTime dateTime:
                    return $"'{dateTime:yyyy-MM-ddThh:mm:ss.fff}'";
                case string str:
                    return $"'{str}'";
                case bool boolean:
                    return boolean ? "1" : "0";
                default:
                    return value.ToString();
            }
        }

        private static object GetValue(Expression member)
        {
            var getter = Expression.Lambda<Func<object>>(Expression.Convert(member, typeof(object))).Compile();
            return getter();
        }
    }
}
