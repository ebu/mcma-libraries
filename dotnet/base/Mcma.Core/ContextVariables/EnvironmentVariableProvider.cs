
using System;
using System.Collections.Generic;
using System.Linq;

namespace Mcma.Core.ContextVariables
{
    public class EnvironmentVariableProvider : ContextVariableProvider
    {
        public EnvironmentVariableProvider()
            : base(Environment.GetEnvironmentVariables().Keys.OfType<string>().Distinct().ToDictionary(k => k, k => Environment.GetEnvironmentVariable(k)))
        {
        }

        public static EnvironmentVariableProvider Instance { get; } = new EnvironmentVariableProvider();
    }
}