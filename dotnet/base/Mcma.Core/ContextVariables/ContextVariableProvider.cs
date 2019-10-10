using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Mcma.Core.ContextVariables
{
    public abstract class ContextVariableProvider : IContextVariableProvider
    {
        protected ContextVariableProvider(IDictionary<string, string> contextVariables)
        {
            ContextVariables = new Dictionary<string, string>(contextVariables, StringComparer.OrdinalIgnoreCase);
        }

        private Dictionary<string, string> ContextVariables { get; }

        public IReadOnlyDictionary<string, string> GetAllContextVariables() => new ReadOnlyDictionary<string, string>(ContextVariables);

        public string GetRequiredContextVariable(string key) => ContextVariables.ContainsKey(key) ? ContextVariables[key] : throw new Exception($"Required context variable with key '{key}' is missing.");

        public string GetOptionalContextVariable(string key, string defaultValue = null) => ContextVariables.ContainsKey(key) ? ContextVariables[key] : defaultValue;

        public IContextVariableProvider Merge(IContextVariableProvider contextVariableProvider)
            => Merge(contextVariableProvider.GetAllContextVariables().ToDictionary());

        public IContextVariableProvider Merge(IDictionary<string, string> contextVariables)
        {
            foreach (var kvp in contextVariables)
                ContextVariables[kvp.Key] = kvp.Value;

            return this;
        }
    }
}