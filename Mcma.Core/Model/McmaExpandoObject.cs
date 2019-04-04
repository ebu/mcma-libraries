using System;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Linq.Expressions;
using Mcma.Core.Logging;

namespace Mcma.Core
{
    public class McmaExpandoObject : IDictionary<string, object>, IDynamicMetaObjectProvider
    {
        private ExpandoObject ExpandoObject { get; } = new ExpandoObject();

        private IDictionary<string, object> PropertyDictionary => ExpandoObject;
        
        public object this[string key] { get => PropertyDictionary[key]; set => PropertyDictionary[key] = value; }

        public bool HasProperty(string key, bool caseSensitive = true)
        {
            var dict = GetPropertyDictionary(caseSensitive);
            return dict.ContainsKey(key);
        }

        public T Get<T>(string key, bool caseSensitive = true)
        {
            var dict = GetPropertyDictionary(caseSensitive);
            return dict.ContainsKey(key) ? (T)dict[key] : default(T);
        }

        public T GetOrAdd<T>(string key, bool caseSensitive = true) where T : new()
            => TryGet<T>(key, false, out var val) ? val : Set(key, new T());
        
        public bool TryGet<T>(string key, out T value) => TryGet<T>(key, true, out value);
        
        public bool TryGet<T>(string key, bool caseSensitive, out T value)
        {
            var dict = GetPropertyDictionary(caseSensitive);

            value = default(T);
            if (dict.ContainsKey(key))
            {
                value = (T)dict[key];
                return true;
            }
            
            return false;
        }

        public T Set<T>(string key, T value) => (T)(this[key] = value);

        private IDictionary<string, object> GetPropertyDictionary(bool caseSensitive)
            => caseSensitive ? PropertyDictionary : new Dictionary<string, object>(PropertyDictionary, StringComparer.OrdinalIgnoreCase);

        #region Dictionary & Dynamic Implementations

        ICollection<string> IDictionary<string, object>.Keys => PropertyDictionary.Keys;

        ICollection<object> IDictionary<string, object>.Values => PropertyDictionary.Values;

        int ICollection<KeyValuePair<string, object>>.Count => PropertyDictionary.Count;

        bool ICollection<KeyValuePair<string, object>>.IsReadOnly => PropertyDictionary.IsReadOnly;

        void IDictionary<string, object>.Add(string key, object value) => PropertyDictionary.Add(key, value);

        void ICollection<KeyValuePair<string, object>>.Add(KeyValuePair<string, object> item) => PropertyDictionary.Add(item);
        
        void ICollection<KeyValuePair<string, object>>.Clear() => PropertyDictionary.Clear();

        bool ICollection<KeyValuePair<string, object>>.Contains(KeyValuePair<string, object> item) => PropertyDictionary.Contains(item);

        bool IDictionary<string, object>.ContainsKey(string key) => PropertyDictionary.ContainsKey(key);

        void ICollection<KeyValuePair<string, object>>.CopyTo(KeyValuePair<string, object>[] array, int arrayIndex) => PropertyDictionary.CopyTo(array, arrayIndex);

        IEnumerator<KeyValuePair<string, object>> IEnumerable<KeyValuePair<string, object>>.GetEnumerator() => PropertyDictionary.GetEnumerator();

        bool IDictionary<string, object>.Remove(string key) => PropertyDictionary.Remove(key);

        bool ICollection<KeyValuePair<string, object>>.Remove(KeyValuePair<string, object> item) => PropertyDictionary.Remove(item);

        bool IDictionary<string, object>.TryGetValue(string key, out object value) => PropertyDictionary.TryGetValue(key, out value);

        IEnumerator IEnumerable.GetEnumerator() => PropertyDictionary.GetEnumerator();

        DynamicMetaObject IDynamicMetaObjectProvider.GetMetaObject(Expression parameter) => ((IDynamicMetaObjectProvider)ExpandoObject).GetMetaObject(parameter);

        #endregion
    }
}