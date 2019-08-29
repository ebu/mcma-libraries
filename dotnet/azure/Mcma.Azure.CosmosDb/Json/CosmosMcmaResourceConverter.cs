using System;
using System.Collections.Generic;
using System.Linq;
using Mcma.Core;
using Mcma.Core.Logging;
using Mcma.Core.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mcma.Azure.CosmosDb.Json
{
    internal class CosmosMcmaObjectConverter : McmaJsonConverter
    {
        private static readonly string CosmosDbTypePropertyName = nameof(McmaObject.Type).ToLower();

        public override bool CanConvert(Type objectType) => typeof(McmaObject).IsAssignableFrom(objectType);

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            try
            {
                var jObj = JObject.Load(reader);

                var serializedType = GetSerializedType(jObj.Property(CosmosDbTypePropertyName), objectType);
                var dynamicObj = (IDictionary<string, object>)Activator.CreateInstance(serializedType);

                var jsonProps =
                    jObj.Properties()
                        .Where(p =>
                            !p.Name.StartsWith("_") &&
                            !p.Name.Equals(CosmosDbTypePropertyName, StringComparison.OrdinalIgnoreCase));

                foreach (var jsonProp in jsonProps)
                    if (!TryReadClrProperty(serializedType, dynamicObj, serializer, jsonProp))
                        dynamicObj[jsonProp.Name] = ConvertJsonToClr(jsonProp.Value, serializer);

                return dynamicObj;
            }
            catch (Exception ex)
            {
                throw new Exception($"An error occurred reading JSON for an object of type {objectType.Name}. See inner exception for details.", ex);
            }
        }

        protected bool TryReadClrProperty(Type objectType, object obj, JsonSerializer serializer, JProperty jsonProp)
        {
            var clrProp = objectType.GetProperties().FirstOrDefault(p => p.CanWrite && p.Name.Equals(jsonProp.Name, StringComparison.OrdinalIgnoreCase));
            if (clrProp != null)
            {
                try
                {
                    object value;
                    if (jsonProp.Value.Type == JTokenType.Null)
                        value = null;
                    else if (clrProp.Name == nameof(McmaResource.Id))
                        value = Uri.UnescapeDataString(jsonProp.Value.Value<string>());
                    else
                        value = jsonProp.Value.ToObject(clrProp.PropertyType, serializer);

                    clrProp.SetValue(obj, value);
                    return true;
                }
                catch (Exception ex)
                {
                    Logger.Error($"Failed to set property {clrProp.Name} on type {objectType.Name} with JSON value {jsonProp.Value.ToString()}: {ex}");
                }
            }

            return false;
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            writer.WriteStartObject();

            writer.WritePropertyName(CosmosDbTypePropertyName);
            writer.WriteValue(((McmaObject)value).Type);

            var propertyDictionary = GetPropertyDictionary(value);
            if (propertyDictionary.ContainsKey(nameof(McmaResource.Id)) && propertyDictionary[nameof(McmaResource.Id)] is string id)
                propertyDictionary[nameof(McmaResource.Id)] = Uri.EscapeDataString(id);

            WriteProperties(writer, serializer, propertyDictionary, false);

            WriteProperties(writer, serializer, (IDictionary<string, object>)value, false);

            writer.WriteEndObject();
        }
    }
}
