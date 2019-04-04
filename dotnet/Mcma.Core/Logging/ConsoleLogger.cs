using System;

namespace Mcma.Core.Logging
{
    public class ConsoleLogger : ILogger
    {
        private void WriteToConsole(string message, object[] args)
        {
            if (args != null && args.Length > 0)
                Console.WriteLine(message, args);
            else
                Console.WriteLine(message);
        }

        public void Debug(string message, params object[] args) => WriteToConsole(message, args);

        public void Info(string message, params object[] args) => WriteToConsole(message, args);

        public void Warn(string message, params object[] args) => WriteToConsole(message, args);

        public void Error(string message, params object[] args) => WriteToConsole(message, args);

        public void Exception(Exception ex) => Console.WriteLine(ex);
    }
}