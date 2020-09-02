using System.Collections.Generic;

namespace Mcma.Context
{
    public interface IContextVariableProvider
    {
        IReadOnlyDictionary<string, string> GetAllContextVariables();

        string GetRequiredContextVariable(string key);

        string GetOptionalContextVariable(string key, string defaultValue = null);

        void SetContextVariable(string key, string value);
    }
}