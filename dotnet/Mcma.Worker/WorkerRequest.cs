using System;
using System.Collections.Generic;
using Mcma.Core;
using Mcma.Core.Serialization;
using Newtonsoft.Json.Linq;

namespace Mcma.Worker
{
    public class WorkerRequest : IContextVariableProvider
    {
        public string OperationName { get; set; }

        public IReadOnlyDictionary<string, string> ContextVariables { get; set; }

        public JObject Input { get; set; }

        public T GetInput<T>()
        {
            try
            {
                 return Input != null ? Input.ToMcmaObject<T>() : default(T);
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Worker request input could not be deserialized to type {typeof(T).Name}. See inner exception for details.", ex);
            }
        }

        public bool TryGetInput<T>(out T dataObject)
        {
            dataObject = default(T);
            try
            {
                 dataObject = GetInput<T>();

                 return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
