using System;
using Mcma.Serialization;
using Newtonsoft.Json.Linq;

namespace Mcma.Logging
{
    public class LogEvent
    {
        public LogEvent(
            string type,
            int level,
            string source,
            string requestId,
            DateTime timestamp, 
            string message,
            object[] args,
            McmaTracker tracker = null)
        {
            Type = type;
            Level = level;
            Source = source;
            RequestId = requestId;
            Timestamp = timestamp;
            Message = message;
            Args = args;
            Tracker = tracker;
        }
        
        public string Type { get; }
        public int Level  { get; }
        public string Source  { get; }
        public string RequestId { get; }
        public DateTimeOffset Timestamp  { get; }
        public string Message { get; }
        public object[] Args { get; }
        public McmaTracker Tracker { get; }

        public override string ToString()
        {
            var json = (JObject)McmaJson.ToMcmaJson(this);

            var trackerProperty = json.Property(nameof(Tracker), StringComparison.OrdinalIgnoreCase);
            if (trackerProperty != null)
                trackerProperty.Remove();

            if (Tracker != null)
            {
                json["trackerId"] = Tracker.Id;
                json["trackerLabel"] = Tracker.Label;

                if (Tracker.Custom != null)
                    foreach (var customProperty in Tracker.Custom)
                    {
                        var customPropertyKey =
                            nameof(Tracker.Id).Equals(customProperty.Key, StringComparison.OrdinalIgnoreCase) || 
                            nameof(Tracker.Label).Equals(customProperty.Key, StringComparison.OrdinalIgnoreCase)
                                ? $"trackerCustom{customProperty.Key}"
                                : $"tracker{customProperty.Key}";

                        json[customPropertyKey] = customProperty.Value;
                    }
            }

            return json.ToString();
        }
    }
}