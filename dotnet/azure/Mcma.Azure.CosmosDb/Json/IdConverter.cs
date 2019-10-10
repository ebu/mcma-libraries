using System;
using Newtonsoft.Json;

namespace Mcma.Azure.CosmosDb.Json
{
    internal class IdConverter : JsonConverter<string>
    {
        public override string ReadJson(JsonReader reader, Type objectType, string existingValue, bool hasExistingValue, JsonSerializer serializer)
            => Uri.UnescapeDataString((string)reader.Value);

        public override void WriteJson(JsonWriter writer, string value, JsonSerializer serializer)
            => writer.WriteValue(Uri.EscapeDataString(value));
    }
}