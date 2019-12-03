using System;

namespace Mcma.Core.Logging
{
    public class LogEvent
    {
        public DateTimeOffset Timestamp  { get; set; }
        public int Level  { get; set; }
        public string Source  { get; set; } = string.Empty;
        public string Type { get; set; }
        public string TrackerId { get; set; } = string.Empty;
        public string TrackerLabel { get; set; } = string.Empty;
        public string Message { get; set; }
        public object[] Args { get; set; }
    }
}