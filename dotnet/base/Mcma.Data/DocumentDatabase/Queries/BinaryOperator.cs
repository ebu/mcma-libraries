using System.Linq;

namespace Mcma.Data.DocumentDatabase.Queries
{
    public class BinaryOperator
    {
        public static readonly BinaryOperator EqualTo = new BinaryOperator("=");
        public static readonly BinaryOperator NotEqualTo = new BinaryOperator("!=");
        public static readonly BinaryOperator LessThan = new BinaryOperator("<");
        public static readonly BinaryOperator LessThanOrEqualTo = new BinaryOperator("<=");
        public static readonly BinaryOperator GreaterThan = new BinaryOperator(">");
        public static readonly BinaryOperator GreaterThanOrEqualTo = new BinaryOperator(">=");
        
        public static readonly string[] Operators = { EqualTo, NotEqualTo, LessThan, LessThanOrEqualTo, GreaterThan, GreaterThanOrEqualTo };

        private BinaryOperator(string @operator)
        {
            if (!Operators.Any(op => op == @operator))
                throw new McmaException($"Invalid operatoer '{@operator}'");

            Operator = @operator;
        }

        private string Operator { get; }

        public static implicit operator BinaryOperator(string @operator) => new BinaryOperator(@operator);

        public static implicit operator string(BinaryOperator @operator) => @operator.Operator;

        public override string ToString() => this;
    }
}