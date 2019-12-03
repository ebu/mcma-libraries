using System;
using System.IO;
using System.Collections.Generic;
using Amazon.Lambda.Core;
using Newtonsoft.Json;
using Mcma.Core.Serialization;
using Mcma.Core.Logging;

namespace Mcma.Aws.Lambda
{
    public class McmaLambdaSerializer : ILambdaSerializer
    {
        public void Serialize<T>(T response, Stream responseStream)
        {
            try
            {
                var writer = new StreamWriter(responseStream);
                McmaJson.Serializer.Serialize(writer, response);
                writer.Flush();
            }
            catch (Exception ex)
            {
                Logger.System.Error($"An error occurred serializing object of type {typeof(T).FullName}.", ex);
                throw;
            }
        }
        
        public T Deserialize<T>(Stream requestStream)
        {
            try
            {
                return McmaJson.Serializer.Deserialize<T>(new JsonTextReader(new StreamReader(requestStream)));
            }
            catch (Exception ex)
            {
                Logger.System.Error($"An error occurred deserializing object of type {typeof(T).FullName}.", ex);
                throw;
            }
        }
    }
}