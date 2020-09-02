namespace Mcma.Logging
{
    public static class LogType
    {
        public const string Fatal = "FATAL";
        public const string Error = "ERROR";
        public const string Warn = "WARN";
        public const string Info = "INFO";
        public const string Debug = "DEBUG";
        
        internal const string FunctionStart = "FUNCTION_START";
        internal const string FunctionEnd = "FUNCTION_END";
        internal const string JobStart = "JOB_START";
        internal const string JobUpdate = "JOB_UPDATE";
        internal const string JobEnd = "JOB_END";
    }
}