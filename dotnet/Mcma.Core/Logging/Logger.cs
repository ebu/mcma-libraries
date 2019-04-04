using System;

namespace Mcma.Core.Logging
{
    public static class Logger
    {
        public static ILogger Global { get; set; } = new ConsoleLogger();

        public static void Debug(string message, params object[] args) => Global.Debug(message, args);
        
        public static void Info(string message, params object[] args) => Global.Info(message, args);
        
        public static void Warn(string message, params object[] args) => Global.Warn(message, args);
        
        public static void Error(string message, params object[] args) => Global.Error(message, args);
        
        public static void Exception(Exception ex) => Global.Exception(ex);
    }
}