using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Mcma.Core.Logging;
using Mcma.Core.Serialization;

namespace Mcma.Client
{
    public static class HttpContentExtensions
    {
        public static async Task<JToken> ReadAsJsonAsync(this HttpContent content)
        {
            var responseBody = await content.ReadAsStringAsync();

            return !string.IsNullOrWhiteSpace(responseBody) ? JToken.Parse(responseBody) : JValue.CreateNull();
        }

        public static async Task<JToken> ReadAsJsonArrayAsync(this HttpContent content)
            => (JArray)await content.ReadAsJsonAsync();

        public static async Task<JObject> ReadAsJsonObjectAsync(this HttpContent content)
        {
            var jToken = await content.ReadAsJsonAsync();

            if (jToken.Type == JTokenType.Null)
                return null;

            if (!(jToken is JObject jObj))
                throw new Exception($"Cannot parse response as an object because the returned JSON is a token of type '{jToken.Type}'.");

            return jObj;
        }

        public static async Task<T[]> ReadAsArrayFromJsonAsync<T>(this HttpContent content, bool throwIfAnyFailToDeserialize = true)
        {
            var jsonArray = await content.ReadAsJsonArrayAsync();

            var objects = new List<T>();
            foreach (var item in jsonArray.OfType<JObject>())
            {
                try
                {
                    objects.Add(item.ToMcmaObject<T>());
                }
                catch (Exception ex)
                {
                    if (throwIfAnyFailToDeserialize) 
                        throw;

                    Logger.Warn($"Failed to instantiate json {item.ToString()} as a {typeof(T).Name} due to error {ex}");
                }
            }

            return objects.ToArray();
        }

        public static async Task<object[]> ReadAsArrayFromJsonAsync(this HttpContent content, Type objectType, bool throwIfAnyFailToDeserialize = true)
        {
            var jsonArray = await content.ReadAsJsonArrayAsync();

            var objects = new List<object>();
            foreach (var item in jsonArray.OfType<JObject>())
            {
                try
                {
                    objects.Add(item.ToMcmaObject(objectType));
                }
                catch (Exception ex)
                {
                    if (throwIfAnyFailToDeserialize) 
                        throw;

                    Logger.Warn($"Failed to instantiate json {item.ToString()} as a {objectType.Name} due to error {ex}");
                }
            }

            return objects.ToArray();
        }

        public static async Task<T> ReadAsObjectFromJsonAsync<T>(this HttpContent content) where T : class
            => (await content.ReadAsJsonObjectAsync())?.ToMcmaObject<T>();

        public static async Task<object> ReadAsObjectFromJsonAsync(this HttpContent content, Type objectType)
            => (await content.ReadAsJsonObjectAsync())?.ToMcmaObject(objectType);
    }
}