using System;
using Newtonsoft.Json;

namespace Mcma.Azure.CosmosDb
{
    internal class IdConverter : JsonConverter<string>
    {
        public override string ReadJson(JsonReader reader, Type objectType, string existingValue, bool hasExistingValue, JsonSerializer serializer)
            => reader.Value != null ? Uri.UnescapeDataString((string)reader.Value) : throw new McmaException("ID cannot be null.");

        public override void WriteJson(JsonWriter writer, string value, JsonSerializer serializer)
            => writer.WriteValue(Uri.EscapeDataString(value));
    }
}