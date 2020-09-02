using System;

namespace Mcma
{
    public class Job : JobBase
    {
        public string ParentId { get; set; }

        public string JobProfile { get; set; }

        public JobParameterBag JobInput { get; set; }

        public long? Timeout { get; set; }

        public DateTime? Deadline { get; set; }

       public McmaTracker Tracker { get; set; }

        public NotificationEndpoint NotificationEndpoint { get; set; }
    }
}