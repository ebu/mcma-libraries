using System;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Mcma.Core.Serialization;
using System.Linq;
using Mcma.Core.Logging;
using System.Collections.Generic;

namespace Mcma.Core
{
    public static class HttpContentExtensions
    {
        public static async Task<JToken> ReadAsJsonAsync(this HttpContent content)
            => JToken.Parse(await content.ReadAsStringAsync());

        public static async Task<JToken> ReadAsJsonArrayAsync(this HttpContent content)
            => (JArray)await content.ReadAsJsonAsync();

        public static async Task<JToken> ReadAsJsonObjectAsync(this HttpContent content)
            => (JObject)await content.ReadAsJsonAsync();

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

        public static async Task<T> ReadAsObjectFromJsonAsync<T>(this HttpContent content)
            => (await content.ReadAsJsonObjectAsync()).ToMcmaObject<T>();
    }
}