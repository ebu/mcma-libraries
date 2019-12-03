using System;
using Mcma.Core.Serialization;
using Newtonsoft.Json.Linq;

namespace Mcma.Core.Logging
{
    public class ConsoleLogger : Logger
    {
        public ConsoleLogger(string source, McmaTracker tracker = null)
            : base(source, tracker)
        {
        }

        protected override void Log(LogEvent logEvent)
        {
            if (logEvent.Level <= 0)
                return;

            if (logEvent.Level < 200)
                WriteToConsole(logEvent, ConsoleColor.Red);
            else if (logEvent.Level < 300)
                WriteToConsole(logEvent, ConsoleColor.Yellow);
            else
                WriteToConsole(logEvent);
        }

        private static void WriteToConsole(LogEvent logEvent, ConsoleColor? color = null)
        {
            var origColor = Console.ForegroundColor;
            try
            {
                if (color.HasValue)
                    Console.ForegroundColor = color.Value;

                var message =
                    string.Join("|",
                        logEvent.Timestamp.ToString("yyyy-MM-ddThh:mm:ss.fff"),
                        logEvent.Level,
                        logEvent.Source,
                        logEvent.Type,
                        logEvent.TrackerId ?? "(empty)",
                        logEvent.TrackerLabel ?? "(empty)",
                        logEvent.Message ?? "(empty)",
                        logEvent.Args != null ? JArray.FromObject(logEvent.Args).ToString() : "(empty)");

                Console.WriteLine(message);
            }
            finally
            {
                Console.ForegroundColor = origColor;
            }
        }
    }
}