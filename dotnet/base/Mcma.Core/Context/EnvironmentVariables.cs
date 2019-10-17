
using System;
using System.Linq;

namespace Mcma.Core.Context
{
    public class EnvironmentVariables : ContextVariables
    {
        public EnvironmentVariables(EnvironmentVariableTarget target = EnvironmentVariableTarget.Process)
            : base(Environment.GetEnvironmentVariables(target).Keys.OfType<string>().Distinct().ToDictionary(k => k, k => Environment.GetEnvironmentVariable(k)))
        {
        }

        public static EnvironmentVariables Instance { get; } = new EnvironmentVariables();
    }
}