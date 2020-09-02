using System;

namespace Mcma.Data
{
    public class LockData
    {
        public string MutexHolder { get; set; }
        
        public DateTime Timestamp { get; set; }
        
        public string VersionId { get; set; }
    }
}