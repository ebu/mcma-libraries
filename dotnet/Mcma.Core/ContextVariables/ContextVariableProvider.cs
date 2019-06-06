using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Mcma.Core.ContextVariables
{
    public abstract class ContextVariableProvider : IContextVariableProvider
    {
        protected ContextVariableProvider(IDictionary<string, string> contextVariables)
        {
            ContextVariables =
                new ReadOnlyDictionary<string, string>(
                    new Dictionary<string, string>(contextVariables, StringComparer.OrdinalIgnoreCase)
                );
        }

        private IReadOnlyDictionary<string, string> ContextVariables { get; }

        public IReadOnlyDictionary<string, string> GetAllContextVariables() => ContextVariables;

        public string GetRequiredContextVariable(string key) => ContextVariables.ContainsKey(key) ? ContextVariables[key] : throw new Exception($"Required context variable with key '{key}' is missing.");

        public string GetOptionalContextVariable(string key, string defaultValue = null) => ContextVariables.ContainsKey(key) ? ContextVariables[key] : defaultValue;
    }
}