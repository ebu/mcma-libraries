using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using Mcma.Core.Utility;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mcma.Core.Serialization
{
    public class McmaExpandoObjectConverter : McmaJsonConverter
    {
        public override bool CanConvert(Type objectType) => objectType == typeof(McmaExpandoObject);

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var jObj = JObject.Load(reader);

            IDictionary<string, object> expando = new McmaExpandoObject();

            foreach (var jsonProp in jObj.Properties())
                expando[jsonProp.Name] = ConvertJsonToClr(jsonProp.Value, serializer);

            return expando;
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            writer.WriteStartObject();

            WriteProperties(writer, serializer, (IDictionary<string, object>)value, true);

            writer.WriteEndObject();
        }
    }
}