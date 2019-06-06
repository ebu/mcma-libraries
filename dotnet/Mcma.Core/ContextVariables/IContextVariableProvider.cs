using System.Collections.Generic;

namespace Mcma.Core.ContextVariables
{
    public interface IContextVariableProvider
    {
        IReadOnlyDictionary<string, string> GetAllContextVariables();

        string GetRequiredContextVariable(string key);

        string GetOptionalContextVariable(string key, string defaultValue = null);
    }
}