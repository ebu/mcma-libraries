using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Mcma.Context
{
    public class ContextVariableProvider : McmaExpandoObject, IContextVariableProvider
    {
        public ContextVariableProvider(IDictionary<string, string> contextVariables)
        {
            ContextVariableDictionary = new Dictionary<string, string>(contextVariables, StringComparer.OrdinalIgnoreCase);
        }

        private Dictionary<string, string> ContextVariableDictionary { get; }

        public IReadOnlyDictionary<string, string> GetAllContextVariables() => new ReadOnlyDictionary<string, string>(ContextVariableDictionary);

        public string GetRequiredContextVariable(string key)
            => ContextVariableDictionary.ContainsKey(key)
                ? ContextVariableDictionary[key]
                : throw new McmaException($"Required context variable with key '{key}' is missing.");

        public string GetOptionalContextVariable(string key, string defaultValue = null)
            => ContextVariableDictionary.ContainsKey(key) ? ContextVariableDictionary[key] : defaultValue;

        public void SetContextVariable(string key, string value)
            => ContextVariableDictionary[key] = value;

        public IContextVariableProvider Merge(IContextVariableProvider contextVariables)
            => Merge(contextVariables.GetAllContextVariables().ToDictionary());

        public IContextVariableProvider Merge(IDictionary<string, string> contextVariables)
        {
            foreach (var kvp in contextVariables)
                ContextVariableDictionary[kvp.Key] = kvp.Value;

            return this;
        }
    }
}