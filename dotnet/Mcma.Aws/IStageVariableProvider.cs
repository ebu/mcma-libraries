using System.Collections.Generic;

namespace Mcma.Aws
{
    public interface IStageVariableProvider
    {
        IDictionary<string, string> StageVariables { get; }
    }
}