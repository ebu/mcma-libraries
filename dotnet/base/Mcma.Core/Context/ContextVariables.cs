using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Mcma.Core.Context
{
    public class ContextVariables : IContextVariables
    {
        public ContextVariables(IDictionary<string, string> contextVariables)
        {
            ContextVariableDictionary = new Dictionary<string, string>(contextVariables, StringComparer.OrdinalIgnoreCase);
        }

        private Dictionary<string, string> ContextVariableDictionary { get; }

        public IReadOnlyDictionary<string, string> GetAll() => new ReadOnlyDictionary<string, string>(ContextVariableDictionary);

        public string GetRequired(string key)
            => ContextVariableDictionary.ContainsKey(key)
                ? ContextVariableDictionary[key]
                : throw new Exception($"Required context variable with key '{key}' is missing.");

        public string GetOptional(string key, string defaultValue = null)
            => ContextVariableDictionary.ContainsKey(key) ? ContextVariableDictionary[key] : defaultValue;

        public void Set(string key, string value)
            => ContextVariableDictionary[key] = value;

        public IContextVariables Merge(IContextVariables contextVariables)
            => Merge(contextVariables.GetAll().ToDictionary());

        public IContextVariables Merge(IDictionary<string, string> contextVariables)
        {
            foreach (var kvp in contextVariables)
                ContextVariableDictionary[kvp.Key] = kvp.Value;

            return this;
        }
    }
}