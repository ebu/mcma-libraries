
using System;
using System.Linq;

namespace Mcma.Context
{
    public class EnvironmentVariableProvider : ContextVariableProvider
    {
        public EnvironmentVariableProvider(EnvironmentVariableTarget target = EnvironmentVariableTarget.Process)
            : base(Environment.GetEnvironmentVariables(target).Keys.OfType<string>().Distinct().ToDictionary(k => k, k => Environment.GetEnvironmentVariable(k)))
        {
        }

        public static EnvironmentVariableProvider Instance { get; } = new EnvironmentVariableProvider();
    }
}