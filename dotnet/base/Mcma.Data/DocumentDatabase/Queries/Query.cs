namespace Mcma.Data.DocumentDatabase.Queries
{
    public class Query<T>
    {
        public int? PageNumber { get; set; }

        public int? PageSize { get; set; }

        public string Path { get; set; }
        
        public IFilterExpression<T> FilterExpression { get; set; }
        
        public string SortBy { get; set; }

        public bool SortAscending { get; set; } = true;

        public Query<T> AddFilterExpression(IFilterExpression<T> filterExpression)
        {
            FilterExpression =
                FilterExpression != null
                ? new FilterCriteriaGroup<T> {Children = new[] {FilterExpression, filterExpression}, LogicalOperator = LogicalOperator.And}
                : filterExpression;
            
            return this;
        }
    }
}