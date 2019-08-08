using System.Collections.Generic;

namespace Mcma.Api
{
    public class WorkerRequest
    {
        public string OperationName { get; set; }

        public IDictionary<string, string> ContextVariables { get; set; }

        public object Input { get; set; }
    }
}
