using System.Linq;
using Mcma.Core.Serialization;
using Newtonsoft.Json;

namespace Mcma.Azure.CosmosDb.Json
{
    public static class McmaCosmosDbSerializationExtensions
    {
        public static JsonSerializerSettings ForCosmosDb(this JsonSerializerSettings settings)
        {
            var mcmaObjectConverter = settings.Converters.OfType<McmaObjectConverter>().FirstOrDefault();
            if (mcmaObjectConverter != null)
                settings.Converters.Remove(mcmaObjectConverter);

            settings.Converters.Add(new CosmosMcmaObjectConverter());

            return settings;
        }
    }
}
