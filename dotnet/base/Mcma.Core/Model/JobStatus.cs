using System;

namespace Mcma.Core
{
    public class JobStatus
    {
        public static readonly JobStatus Queued = new JobStatus(nameof(Queued));
        
        public static readonly JobStatus Scheduled = new JobStatus(nameof(Scheduled));
        
        public static readonly JobStatus Running = new JobStatus(nameof(Running));

        public static readonly JobStatus Completed = new JobStatus(nameof(Completed));

        public static readonly JobStatus Failed = new JobStatus(nameof(Failed));

        public JobStatus(string status)
        {
            Status = status.ToUpper();
        }

        private string Status { get; }

        public static implicit operator string(JobStatus status) => status?.Status;

        public static implicit operator JobStatus(string statusText) => statusText != null ? new JobStatus(statusText) : null;

        public static bool operator ==(JobStatus status1, JobStatus status2) => AreEqual(status1, status2);

        public static bool operator !=(JobStatus status1, JobStatus status2) => !AreEqual(status1, status2);

        public static bool operator ==(string status1, JobStatus status2) => AreEqual(status1, status2);

        public static bool operator !=(string status1, JobStatus status2) => !AreEqual(status1, status2);

        public static bool operator ==(JobStatus status1, string status2) => AreEqual(status1, status2);

        public static bool operator !=(JobStatus status1, string status2) => !AreEqual(status1, status2);

        private static bool AreEqual(string status1, string status2)
            => (status1 == null && status2 == null) || (status1 != null && status1.Equals(status2));

        public override bool Equals(object obj)
        {
            switch (obj)
            {
                case string statusText:
                    return Status.Equals(statusText, StringComparison.OrdinalIgnoreCase);
                case JobStatus statusObj:
                    return Status.Equals(statusObj.Status, StringComparison.OrdinalIgnoreCase);
                default:
                    return false;
            }
        }

        public override int GetHashCode() => Status.GetHashCode();
    }
}