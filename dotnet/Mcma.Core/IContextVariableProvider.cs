using System.Collections.Generic;

namespace Mcma.Core
{
    public interface IContextVariableProvider
    {
        IReadOnlyDictionary<string, string> ContextVariables { get; }
    }
}