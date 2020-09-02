using System.Linq;
using Newtonsoft.Json.Linq;

namespace Mcma.Aws.DynamoDb
{
    public static class JTokenExtensions
    {
        public static JToken RemoveEmptyStrings(this JToken jToken)
        {
            if (jToken == null)
                return null;
            
            switch (jToken.Type)
            {
                case JTokenType.Array:
                {
                    var array = (JArray)jToken;
                    for (var i = array.Count; i >= 0; i--)
                        switch (array[i].Type)
                        {
                            case JTokenType.String when array[i].ToString() == string.Empty:
                                array.RemoveAt(i);
                                break;
                            case JTokenType.Object:
                                array[i].RemoveEmptyStrings();
                                break;
                        }
                    break;
                }
                case JTokenType.Object:
                {
                    var obj = (JObject)jToken;
                    foreach (var prop in obj.Properties().ToList())
                        switch (prop.Value.Type)
                        {
                            case JTokenType.String when prop.Value.ToString() == string.Empty:
                                obj.Remove(prop.Name);
                                break;
                            case JTokenType.Object:
                                prop.Value.RemoveEmptyStrings();
                                break;
                        }
                    break;
                }
            }

            return jToken;
        }
    }
}