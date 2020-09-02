using System;
using System.Collections.Generic;
using System.Linq;
using Mcma.Utility;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mcma.Serialization
{
    public abstract class McmaJsonConverter : JsonConverter
    {
        protected virtual string TypeJsonPropertyName => "@type";

        protected Type GetSerializedType(JObject jObj, Type objectType) => GetSerializedType(jObj.Property(TypeJsonPropertyName), objectType);

        protected Type GetSerializedType(JProperty typeProperty, Type objectType)
        {
            if (typeProperty != null)
            {
                var typeString = typeProperty.Value.Value<string>();

                objectType = McmaTypes.FindType(typeString);
                if (objectType == null)
                    return typeof(McmaObject);
            
                typeProperty.Remove();
                
                return objectType;
            }

            return objectType ?? throw new McmaException($"Unrecognized @type specified in JSON: {typeProperty?.Value?.Value<string>() ?? "<null>"}");
        }

        protected bool IsMcmaObject(JObject jObj)
            => jObj.Properties().Any(p => p.Name.Equals(TypeJsonPropertyName, StringComparison.OrdinalIgnoreCase));

        protected object CreateMcmaObject(JObject jObj, JsonSerializer serializer)
            => jObj.ToObject(GetSerializedType(jObj, null), serializer);

        protected object ConvertJsonToClr(JToken token, JsonSerializer serializer)
        {
            switch (token.Type)
            {
                case JTokenType.Boolean:
                    return token.Value<bool>();
                case JTokenType.Bytes:
                    return token.Value<byte[]>();
                case JTokenType.Date:
                    return token.Value<DateTime>();
                case JTokenType.Float:
                    return token.Value<decimal>();
                case JTokenType.Guid:
                    return token.Value<Guid>();
                case JTokenType.Integer:
                    return token.Value<long>();
                case JTokenType.String:
                case JTokenType.Uri:
                    return token.Value<string>();
                case JTokenType.TimeSpan:
                    return token.Value<TimeSpan>();
                case JTokenType.Null:
                case JTokenType.Undefined:
                    return null;
                case JTokenType.Array:
                    return token.Select(x => ConvertJsonToClr(x, serializer)).ToArray();
                case JTokenType.Object:
                    var jObj = (JObject)token;
                    return IsMcmaObject(jObj) ? CreateMcmaObject(jObj, serializer) : jObj.ToObject<McmaExpandoObject>(serializer);
                default:
                    return token;
            }
        }

        protected IDictionary<string, object> GetPropertyDictionary(object value)
            => value.GetType().GetProperties()
                    .Where(p => p.Name != nameof(McmaObject.Type) && p.CanRead && p.GetIndexParameters().Length == 0)
                    .ToDictionary(p => p.Name, p => p.GetValue(value));

        protected void WriteProperties(JsonWriter writer, JsonSerializer serializer, IDictionary<string, object> properties, bool preserveCasing)
        {
            foreach (var keyValuePair in properties)
            {
                if (keyValuePair.Value == null && serializer.NullValueHandling == NullValueHandling.Ignore)
                    continue;

                writer.WritePropertyName(preserveCasing ? keyValuePair.Key : keyValuePair.Key.PascalCaseToCamelCase());
                serializer.Serialize(writer, keyValuePair.Value);
            }
        }
    }
}