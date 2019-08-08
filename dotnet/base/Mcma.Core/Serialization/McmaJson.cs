using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Mcma.Core.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;

namespace Mcma.Core.Serialization
{
    public static class McmaJson
    {
        public static readonly JsonSerializerSettings DefaultSettings = new JsonSerializerSettings
        {
            ContractResolver = new McmaCamelCasePropertyNamesContractResolver(),
            NullValueHandling = NullValueHandling.Ignore,
            Converters =
            {
                new McmaObjectConverter(),
                new McmaExpandoObjectConverter()
            }
        };

        public static readonly JsonSerializerSettings PreserveCasingSettings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            Converters =
            {
                new McmaObjectConverter(),
                new McmaExpandoObjectConverter()
            }
        };

        public static JsonSerializer DefaultSerializer { get; private set; } = JsonSerializer.CreateDefault(DefaultSettings);

        public static void SetJsonSerializerSettings(JsonSerializerSettings settings) => DefaultSerializer = JsonSerializer.CreateDefault(settings);

        public static T ToMcmaObject<T>(this JToken json) => json.ToObject<T>(DefaultSerializer);

        public static object ToMcmaObject(this JToken json, Type type) => json.ToObject(type, DefaultSerializer);

        public static JToken ToMcmaJson<T>(this T obj, bool preserveCasing = false)
            => JToken.FromObject(obj, preserveCasing ? JsonSerializer.CreateDefault(PreserveCasingSettings) : DefaultSerializer);

        public static async Task<JToken> ReadJsonFromStreamAsync(this Stream stream)
        {
            using (var textReader = new StreamReader(stream))
            using (var jsonReader = new JsonTextReader(textReader))
                return await JToken.LoadAsync(jsonReader);
        }
    }
}