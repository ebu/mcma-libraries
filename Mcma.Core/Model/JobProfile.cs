using System.Collections.Generic;

namespace Mcma.Core
{
    public class JobProfile : McmaResource
    {
        public string Name { get; set; }

        public ICollection<JobParameter> InputParameters { get; set; }

        public ICollection<JobParameter> OutputParameters { get; set; }
        
        public ICollection<JobParameter> OptionalInputParameters { get; set; }
    }
}