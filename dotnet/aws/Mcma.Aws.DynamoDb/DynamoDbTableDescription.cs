namespace Mcma.Aws.DynamoDb
{
    public class DynamoDbTableDescription
    {
        public DynamoDbTableDescription(string tableName, string partitionKeyName, string sortKeyName, string[] indexNames)
        {
            TableName = tableName;
            PartitionKeyName = partitionKeyName;
            SortKeyName = sortKeyName;
            IndexNames = indexNames ?? new string[0];
        }
        
        public string TableName { get; }
        
        public string PartitionKeyName { get; }
        
        public string SortKeyName { get; } 
        
        public string[] IndexNames { get; }
    }
}