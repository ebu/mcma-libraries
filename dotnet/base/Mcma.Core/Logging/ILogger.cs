using System;

namespace Mcma.Core.Logging
{
    public interface ILogger
    {
        void Debug(string message, params object[] args);

        void Debug(params object[] args);
        
        void Info(string message, params object[] args);
        
        void Info(params object[] args);
        
        void Warn(string message, params object[] args);
        
        void Warn(params object[] args);
        
        void Error(string message, params object[] args);
        
        void Error(params object[] args);

        void Fatal(string message, params object[] args);
        
        void Fatal(params object[] args);

        void FunctionStart(string message, params object[] args);

        void FunctionEnd(string message, params object[] args);

        void JobStart(string message, params object[] args);

        void JobEnd(string message, params object[] args);
    }
}