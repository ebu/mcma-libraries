namespace Mcma.Worker
{
    public static class WorkerRequestExtensions
    {
        public static string TableName(this WorkerRequest requestContext)
            => requestContext.ContextVariables.TryGetValue(nameof(TableName), out var tableName) ? tableName : string.Empty;
    }
}
