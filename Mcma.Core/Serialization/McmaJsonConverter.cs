using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using Mcma.Core.Logging;
using Mcma.Core.Utility;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mcma.Core.Serialization
{
    public abstract class McmaJsonConverter : JsonConverter
    {
        protected const string TypeJsonPropertyName = "@type";

        protected Type GetSerializedType(JObject jObj, Type objectType)
        {
            var typeProperty = jObj.Property(TypeJsonPropertyName);
            if (typeProperty != null)
            {
                var typeString = typeProperty.Value.Value<string>();

                objectType = McmaTypes.FindType(typeString);
                if (objectType != null)
                {
                    jObj.Remove(TypeJsonPropertyName);
                    
                    return objectType;
                }
            }

            return objectType;
        }

        protected bool IsMcmaObject(JObject jObj)
            => jObj.Properties().Any(p => p.Name.Equals(TypeJsonPropertyName, StringComparison.OrdinalIgnoreCase));

        protected object CreateMcmaObject(JObject jObj, JsonSerializer serializer)
        {
            var objType = GetSerializedType(jObj, null);
            if (objType == null)
                throw new Exception($"Unrecognized @type specified in JSON: {jObj[TypeJsonPropertyName]}");
            
            return jObj.ToObject(objType, serializer);
        }

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
    }
}