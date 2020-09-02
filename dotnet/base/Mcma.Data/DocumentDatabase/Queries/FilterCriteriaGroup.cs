namespace Mcma.Data.DocumentDatabase.Queries
{
    public class FilterCriteriaGroup<TDoc> : IFilterExpression<TDoc>
    {   
        public IFilterExpression<TDoc>[] Children { get; set; }
        public LogicalOperator LogicalOperator { get; set; }
    }
}