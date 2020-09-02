using System.Linq;

namespace Mcma.Data.DocumentDatabase.Queries
{
    public class LogicalOperator
    {
        public static readonly LogicalOperator And = new LogicalOperator("&&");
        public static readonly LogicalOperator Or = new LogicalOperator("||");
        public static readonly string[] Operators = { And, Or };

        private LogicalOperator(string @operator)
        {
            if (!Operators.Any(op => op == @operator))
                throw new McmaException($"Invalid operatoer '{@operator}'");

            Operator = @operator;
        }

        private string Operator { get; }

        public static implicit operator LogicalOperator(string @operator) => new LogicalOperator(@operator);

        public static implicit operator string(LogicalOperator @operator) => @operator.Operator;
    }
}