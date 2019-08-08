using System;
using Newtonsoft.Json.Serialization;

namespace Mcma.Core.Serialization
{
    public class McmaCamelCasePropertyNamesContractResolver : CamelCasePropertyNamesContractResolver
    {
        protected override JsonDictionaryContract CreateDictionaryContract(Type objectType)
        {
            var contract = base.CreateDictionaryContract(objectType);

            contract.DictionaryKeyResolver = key => key;

            return contract;
        }
    }
}