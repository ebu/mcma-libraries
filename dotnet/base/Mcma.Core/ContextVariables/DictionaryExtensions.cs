using System.Collections.Generic;

namespace Mcma.Core.ContextVariables
{
    public static class DictionaryExtensions
    {
        public static IDictionary<TKey, TValue> ToDictionary<TKey, TValue>(
            this IReadOnlyDictionary<TKey, TValue> readOnly,
            IEqualityComparer<TKey> keyComparer = null)
        {
            var dict = keyComparer != null ? new Dictionary<TKey, TValue>(keyComparer) : new Dictionary<TKey, TValue>();

            foreach (var key in readOnly.Keys)
                dict[key] = readOnly[key];

            return dict;
        }
    }
}