using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Mcma.Worker
{
    public class WorkerRequest
    {
        public string OperationName { get; set; }
        
        public IDictionary<string, string> ContextVariables { get; set; }
        
        public JObject Input { get; set; }
        
        public McmaTracker Tracker { get; set; }
    }
}
