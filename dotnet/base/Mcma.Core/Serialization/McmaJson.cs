using System;
using System.IO;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mcma.Serialization
{
    public static class McmaJson
    {
        public static JsonSerializerSettings DefaultSettings() => DefaultSettings(false);

        private static JsonSerializerSettings DefaultSettings(bool preserveCasing)
        {
            var settings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
                Converters =
                {
                    new McmaObjectConverter(),
                    new McmaExpandoObjectConverter()
                }
            };

            if (!preserveCasing)
                settings.ContractResolver = new McmaCamelCasePropertyNamesContractResolver();

            return settings;
        }

        public static JsonSerializer Serializer { get; private set; } = JsonSerializer.CreateDefault(DefaultSettings(false));

        private static JsonSerializer PreserveCasingSerializer { get; set; } = JsonSerializer.CreateDefault(DefaultSettings(true));

        public static T ToMcmaObject<T>(this JToken json) => json.ToObject<T>(Serializer);

        public static object ToMcmaObject(this JToken json, Type type) => json.ToObject(type, Serializer);

        public static JToken ToMcmaJson<T>(this T obj, bool preserveCasing = false)
            => JToken.FromObject(obj, preserveCasing ? PreserveCasingSerializer : Serializer);

        public static async Task<JToken> ReadJsonFromStreamAsync(this Stream stream)
        {
            using (var textReader = new StreamReader(stream))
            using (var jsonReader = new JsonTextReader(textReader))
                return await JToken.LoadAsync(jsonReader);
        }
    }
}