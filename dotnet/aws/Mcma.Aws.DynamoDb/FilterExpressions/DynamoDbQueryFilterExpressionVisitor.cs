using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Runtime.CompilerServices;
using Mcma.Core;
using Mcma.Core.Utility;
using Expression = System.Linq.Expressions.Expression;

namespace Mcma.Aws.DynamoDb.FilterExpressions
{
    public class DynamoDbQueryFilterExpressionVisitor<T> where T : McmaResource
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

        public string ScanExpressionText { get; private set; } = string.Empty;

        public List<string> AttributeNames { get; } = new List<string>();
        
        public List<object> AttributeValues { get; } = new List<object>();

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
            
            if (!(node.Operand is MemberExpression operandMember))
                throw new NotSupportedException($"Invalid filter expression. Expression '{node}' uses the ! operator on an operand that is not a member of a class.");
            
            AttributeNames.Add(operandMember.Member.Name);
            ScanExpressionText += $"#a{AttributeNames.Count - 1} = false";
        }

        private void VisitBinary(BinaryExpression node)
        {
            var isLogical = node.NodeType == ExpressionType.AndAlso || node.NodeType == ExpressionType.OrElse;

            ScanExpressionText += "(";
            Visit(node.Left);
            if (isLogical && node.Left is MemberExpression leftMember && leftMember.Type == typeof(bool) && leftMember.Member is PropertyInfo)
                ScanExpressionText += " = true";
            ScanExpressionText += " ";

            switch (node.NodeType)
            {
                case ExpressionType.AndAlso:
                    ScanExpressionText += "AND";
                    break;
                case ExpressionType.OrElse:
                    ScanExpressionText += "OR";
                    break;
                case ExpressionType.Equal:
                    ScanExpressionText += "=";
                    break;
                case ExpressionType.NotEqual:
                    ScanExpressionText += "!=";
                    break;
                case ExpressionType.GreaterThan:
                    ScanExpressionText += ">";
                    break;
                case ExpressionType.GreaterThanOrEqual:
                    ScanExpressionText += ">=";
                    break;
                case ExpressionType.LessThan:
                    ScanExpressionText += "<";
                    break;
                case ExpressionType.LessThanOrEqual:
                    ScanExpressionText += "<=";
                    break;
            }

            ScanExpressionText += " ";
            Visit(node.Right);
            if (isLogical && node.Right is MemberExpression rightMember && rightMember.Type == typeof(bool) && rightMember.Member is PropertyInfo)
                ScanExpressionText += " = true";
            ScanExpressionText += ")";
        }

        private void VisitMember(MemberExpression node)
        {
            if (node.Member.DeclaringType == typeof(DateTime) && node.Member.Name == nameof(DateTime.Now))
                ScanExpressionText += DateTimeOffset.Now.ToUnixTimeSeconds();
            else if (node.Member is PropertyInfo)
            {
                AttributeNames.Add(node.Member.Name.PascalCaseToCamelCase());
                ScanExpressionText += $"#a{AttributeNames.Count - 1}";
            }
            else if (node.Member is FieldInfo)
            {
                var value = GetValue(node);
                AttributeValues.Add(value);
                ScanExpressionText += $":v{AttributeValues.Count - 1}";
            }
        }

        private void VisitMethodCall(MethodCallExpression node)
        {
            if (node.Method == StringContainsMethod || node.Method == StringStartsWithMethod || node.Method == StringEndsWithMethod)
            {
                if (!(node.Object is MemberExpression propertyMember))
                    throw new Exception($"Invalid expression. Cannot use string.{node.Method.Name} to check a value that is not a member of the type being queried.");

                var likeClause = "[" + propertyMember.Member.Name + "] LIKE ";

                var likeParam = GetValue(node.Arguments[0]).ToString();
                AttributeValues.Add(likeParam);
                var paramName = ":v" + (AttributeValues.Count - 1);

                if (node.Method == StringContainsMethod || node.Method == StringEndsWithMethod)
                    likeClause += "'%' + ";

                likeClause += paramName;

                if (node.Method == StringContainsMethod || node.Method == StringStartsWithMethod)
                    likeClause += " + '%'";

                ScanExpressionText += likeClause;
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
                var startIndex = AttributeValues.Count;

                foreach (var value in values)
                    AttributeValues.Add(value);
                
                ScanExpressionText += "[" + propertyMember.Member.Name + "] IN (";
                ScanExpressionText += string.Join(",", Enumerable.Range(startIndex, AttributeValues.Count - startIndex).Select(i => $":v{i}"));
                ScanExpressionText += ")";
            }
            else
                throw new NotSupportedException(
                    $"Invalid expression. Expression {node} contains call to unsupported method method {node.Method.DeclaringType.Name}.{node.Method.Name}");
        }

        private void VisitConstant(ConstantExpression node)
        {
            AttributeValues.Add(node.Value);
            ScanExpressionText += $":v{AttributeValues.Count - 1}";
        }

        private static object GetValue(Expression member)
        {
            var getter = Expression.Lambda<Func<object>>(Expression.Convert(member, typeof(object))).Compile();
            return getter();
        }
    }
}