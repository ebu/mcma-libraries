using System;
using Mcma.Core.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mcma.Azure.CosmosDb.Json
{
    internal class PartitionKeyConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType) => true;

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            if (reader.Value is string typeString && objectType == typeof(Type))
                return McmaTypes.FindType(typeString);

            return JToken.ReadFrom(reader).ToObject(objectType);
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (value is Type type)
                value = type.Name;
            
            writer.WriteValue(value);
        }
    }
}