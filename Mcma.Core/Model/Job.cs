namespace Mcma.Core
{
    public class Job : JobBase
    {
        public string JobProfile { get; set; }

        public string JobProcess { get; set; }

        public JobParameterBag JobInput { get; set; }
    }
}