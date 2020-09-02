namespace Mcma
{
    public class JobAssignment : JobBase
    {
        public string Job { get; set; }

        public McmaTracker Tracker { get; set; }

        public NotificationEndpoint NotificationEndpoint { get; set; }
    }
}