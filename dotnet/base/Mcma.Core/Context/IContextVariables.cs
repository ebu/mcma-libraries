using System.Collections.Generic;

namespace Mcma.Core.Context
{
    public interface IContextVariables
    {
        IReadOnlyDictionary<string, string> GetAll();

        string GetRequired(string key);

        string GetOptional(string key, string defaultValue = null);

        void Set(string key, string value);
    }
}