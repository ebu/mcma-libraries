using System.Collections.Generic;

namespace Mcma
{
    public class JobBase : McmaResource
    {
        public string Status { get; set; }
 
        public ProblemDetail Error { get; set; }

        public JobParameterBag JobOutput { get; set; }

        public double? Progress { get; set; }
    }
}