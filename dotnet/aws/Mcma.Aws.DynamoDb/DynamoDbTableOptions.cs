using System.Collections.Generic;

namespace Mcma.Aws.DynamoDb
{
    public class DynamoDbTableOptions
    {
        public bool? ConsistentGet { get; set; }
        
        public bool? ConsistentQuery { get; set; }
        
        public Dictionary<string, string> TopLevelAttributeMappings { get; set; } = new Dictionary<string, string>();
        
        public Dictionary<string, string> IndexNameMappings { get; set; } = new Dictionary<string, string>();
    }
}